mod firewall;
mod api;
mod models;
mod utils;
mod network;
mod logging;
mod firewall_db;
mod network_db;

use axum::{
    Router,
    routing::{get, post, delete, put},
    http::Method,
};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::firewall::Firewall;
use crate::network::NetworkManager;
use crate::api::*;
use crate::logging::{LogManager, LogConfig, RotationConfig, RetentionConfig, PerformanceConfig, RotationInterval, LogType, LogMetadata};
use tower_http::services::ServeDir;
use serde_json::json;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting Open-NGFW Application...");

    // Initialize logging system
    let log_config = LogConfig {
        base_path: std::path::PathBuf::from("./logs"),
        rotation: RotationConfig {
            interval: RotationInterval::Daily,
            max_file_size: 100 * 1024 * 1024, // 100MB
            max_files: 30,
            compression: true,
            compression_level: 6,
        },
        retention: RetentionConfig {
            traffic_logs: std::time::Duration::from_secs(90 * 24 * 60 * 60), // 90 days
            threat_logs: std::time::Duration::from_secs(365 * 24 * 60 * 60), // 365 days
            system_logs: std::time::Duration::from_secs(180 * 24 * 60 * 60), // 180 days
        },
        performance: PerformanceConfig {
            buffer_size: 64 * 1024, // 64KB
            flush_interval: std::time::Duration::from_secs(5),
            max_memory: 512 * 1024 * 1024, // 512MB
        },
    };

    let log_manager = match LogManager::new(log_config).await {
        Ok(manager) => {
            println!("✅ Logging system initialized successfully");
            Arc::new(manager)
        },
        Err(e) => {
            eprintln!("❌ Failed to initialize logging system: {}", e);
            std::process::exit(1);
        }
    };

    // Ghi log hệ thống ra file vật lý khi app khởi động
    let startup_metadata = LogMetadata::system_event(
        "startup",
        "info",
        "core",
        "system"
    );
    let startup_data = json!({
        "event": "system_startup",
        "message": "Open-NGFW application started successfully",
        "component": "core",
        "category": "system",
        "status": "success",
        "version": "1.0.0",
        "uptime": 0
    });
    let _ = log_manager.log_system(startup_metadata, startup_data).await;

    // Log firewall initialization
    let firewall_metadata = LogMetadata::system_event(
        "firewall_init",
        "info",
        "firewall",
        "security"
    );
    let firewall_data = json!({
        "event": "firewall_initialization",
        "message": "Firewall initialized with default rules",
        "component": "firewall",
        "category": "security",
        "status": "success",
        "rules_count": 0
    });
    let _ = log_manager.log_system(firewall_metadata, firewall_data).await;

    // Log network manager initialization
    let network_metadata = LogMetadata::system_event(
        "network_init",
        "info",
        "network",
        "network"
    );
    let network_data = json!({
        "event": "network_initialization",
        "message": "Network manager initialized",
        "component": "network",
        "category": "network",
        "status": "success"
    });
    let _ = log_manager.log_system(network_metadata, network_data).await;

    // Initialize firewall
    let firewall = Arc::new(RwLock::new(Firewall::new().await));
    
    // Set log manager for firewall
    {
        let mut firewall = firewall.write().await;
        firewall.set_log_manager(log_manager.clone());
    }
    
    // Initialize network manager
    let network_manager = Arc::new(RwLock::new(NetworkManager::new().await));
    
    // Configure CORS
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin(Any)
        .allow_headers(Any);

    // Create router with all API endpoints
    let app = Router::new()
        // Dashboard
        .route("/", get(serve_dashboard))
        .route("/network/interfaces", get(serve_network_interfaces))
        .route("/api/dashboard/status", get(dashboard_status))
        // Legacy Firewall API
        .route("/api/rules", get(get_rules))
        .route("/api/rules", post(add_rule))
        .route("/api/rules/:id", delete(delete_rule))
        .route("/api/rules/:id/toggle", put(toggle_rule))
        .route("/api/status", get(get_status))
        .route("/api/statistics", get(get_statistics))
        .route("/api/toggle", post(toggle_firewall))
        // System & Configuration API
        .route("/api/system/config", get(get_system_config))
        .route("/api/system/licenses", get(get_system_licenses))
        .route("/api/system/metrics", get(get_system_metrics))
        // User Management API
        .route("/api/administrators", get(get_administrators))
        .route("/api/user-groups", get(get_user_groups))
        // Network & Interface API
        .route("/api/network/interfaces", get(get_interfaces))
        .route("/api/network/interfaces", post(add_interface))
        .route("/api/network/interfaces/:id", get(get_interface_by_id))
        .route("/api/network/interfaces/:id", put(update_interface))
        .route("/api/network/interfaces/:id", delete(delete_interface))
        .route("/api/network/zones", get(get_network_zones))
        .route("/api/network/static-routes", get(static_routes))
        // Network Hardware Detection API
        .route("/api/network/physical-ports", get(api::get_all_physical_ports))
        .route("/api/network/physical-ports/summary", get(get_physical_ports_summary))
        .route("/api/network/physical-ports/:port_id", get(get_port_details))
        .route("/api/network/physical-ports/:interface_name/statistics", get(get_port_statistics))
        // Firewall & Security API
        .route("/api/firewall/policies", get(get_firewall_policies))
        .route("/api/firewall/address-objects", get(get_address_objects))
        .route("/api/firewall/service-objects", get(get_service_objects))
        // VPN API
        .route("/api/vpn/tunnels", get(get_vpn_tunnels))
        // Security Profiles API
        .route("/api/security/antivirus-profiles", get(get_antivirus_profiles))
        .route("/api/security/webfilter-profiles", get(get_webfilter_profiles))
        // Monitoring & Logging API
        .route("/api/logs/system", get(get_system_logs))
        .route("/api/logs/traffic", get(get_traffic_logs))
        .route("/api/logs/threats", get(get_threat_logs))
        .route("/api/logs", get(api::get_logs))
        // Cloud & Entry API
        .route("/api/cloud/connections", get(get_cloud_connections))
        .route("/api/entry/connections", get(get_entry_connections))
        // Virtualization API
        .route("/api/virtual-machines", get(get_virtual_machines))
        // Legacy API endpoints (for backward compatibility)
        .route("/api/security/topology", get(security_topology))
        .route("/api/network/interfaces-legacy", get(network_interfaces))
        .route("/api/firewall/policies-legacy", get(firewall_policies))
        .route("/api/security/antivirus-legacy", get(antivirus_profiles))
        .route("/api/vpn/ipsec-tunnels", get(ipsec_tunnels))
        .route("/api/system/administrators-legacy", get(administrators))
        .route("/api/logs/traffic-legacy", get(local_traffic_logs))
        .route("/api/monitor/routing", get(routing_monitors))
        .route("/api/wifi/ssids", get(wifi_ssids))
        .route("/network_interfaces.html", get(|| async { axum::response::Html(include_str!("../static/network_interfaces.html")) }))
        .route("/logs.html", get(|| async { axum::response::Html(include_str!("../static/logs.html")) }))
        .route("/analyzer.html", get(|| async { axum::response::Html(include_str!("../static/analyzer.html")) }))
        .route("/reports.html", get(|| async { axum::response::Html(include_str!("../static/reports.html")) }))
        .route("/api/reports/traffic-stats", get(api::get_traffic_stats))
        .route("/api/reports/application-stats", get(api::get_application_stats))
        .route("/api/reports/security-stats", get(api::get_security_stats))
        .route("/api/reports/user-stats", get(api::get_user_stats))
        .route("/api/reports/anomaly-stats", get(api::get_anomaly_stats))
        .route("/api/reports/custom", post(api::custom_report_preview))
        .route("/api/reports/export", post(api::export_report))
        .route("/api/reports/compliance", get(api::get_compliance_mapping))
        .route("/api/reports/export-compliance", post(api::export_compliance_report))
        .route("/api/reports/schedules", get(api::get_schedules))
        .route("/api/reports/schedules", post(api::create_or_update_schedule))
        .route("/api/reports/schedules/:id", delete(api::delete_schedule))
        .route("/api/reports/access", get(api::get_access_list))
        .route("/api/reports/access", post(api::update_access))
        .route("/api/reports/auditlog", get(api::get_audit_log))
        .nest_service("/static", ServeDir::new("static"))
        .layer(cors)
        .with_state((firewall, network_manager, log_manager));

    println!("-> Open-NGFW starting on http://localhost:3000");
    println!("-> Dashboard available at http://localhost:3000");
    println!("-> API documentation available at http://localhost:3000/api");
    println!("-> Logs stored in ./logs/ directory");
    println!("-> Physical port detection available at /api/network/physical-ports");

    // Start server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
} 