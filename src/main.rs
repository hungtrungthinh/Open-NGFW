mod firewall;
mod api;
mod models;
mod utils;
mod network;

use axum::{
    Router,
    routing::{get, post, delete},
    http::Method,
};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::sync::Arc;
use tokio::sync::RwLock;

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

    // Initialize firewall
    let firewall = Arc::new(RwLock::new(firewall::Firewall::new().await));
    
    // Create API routes
    let app = Router::new()
        .route("/api/rules", get(api::get_rules))
        .route("/api/rules", post(api::add_rule))
        .route("/api/rules/:id", delete(api::delete_rule))
        .route("/api/rules/:id/toggle", post(api::toggle_rule))
        .route("/api/status", get(api::get_status))
        .route("/api/status/toggle", post(api::toggle_firewall))
        .route("/api/statistics", get(api::get_statistics))
        .route("/", get(api::serve_dashboard))
        .route("/dashboard", get(api::serve_dashboard))
        .with_state(firewall)
        .layer(
            CorsLayer::new()
                .allow_methods([Method::GET, Method::POST, Method::DELETE])
                .allow_origin(Any)
        );

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    tracing::info!("Open-NGFW dashboard running on http://127.0.0.1:3000");
    
    axum::serve(listener, app).await.unwrap();
} 