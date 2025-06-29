use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{Html, Json, IntoResponse},
};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::firewall::Firewall;
use crate::models::{FirewallRule, CreateRuleRequest};

/// Get all firewall rules
pub async fn get_rules(
    State(firewall): State<Arc<RwLock<Firewall>>>,
) -> Json<Vec<FirewallRule>> {
    let firewall = firewall.read().await;
    let rules = firewall.get_rules().await;
    Json(rules)
}

/// Add a new firewall rule
pub async fn add_rule(
    State(firewall): State<Arc<RwLock<Firewall>>>,
    Json(rule_request): Json<CreateRuleRequest>,
) -> (StatusCode, Json<FirewallRule>) {
    let rule = FirewallRule::new(rule_request);
    let rule_clone = rule.clone();
    let mut firewall = firewall.write().await;
    firewall.add_rule(rule).await;
    (StatusCode::OK, Json(rule_clone))
}

/// Delete a firewall rule by ID
pub async fn delete_rule(
    State(firewall): State<Arc<RwLock<Firewall>>>,
    Path(rule_id): Path<String>,
) -> (StatusCode, Json<serde_json::Value>) {
    let mut firewall = firewall.write().await;
    let success = firewall.remove_rule(&rule_id).await;
    if success {
        (StatusCode::OK, Json(json!({ "message": "Rule deleted successfully" })))
    } else {
        (StatusCode::NOT_FOUND, Json(json!({ "error": "Rule not found" })))
    }
}

/// Toggle a firewall rule's enabled state
pub async fn toggle_rule(
    State(firewall): State<Arc<RwLock<Firewall>>>,
    Path(rule_id): Path<String>,
) -> (StatusCode, Json<serde_json::Value>) {
    let mut firewall = firewall.write().await;
    let success = firewall.toggle_rule(&rule_id).await;
    if success {
        (StatusCode::OK, Json(json!({ "message": "Rule toggled successfully" })))
    } else {
        (StatusCode::NOT_FOUND, Json(json!({ "error": "Rule not found" })))
    }
}

/// Get firewall status
pub async fn get_status(
    State(firewall): State<Arc<RwLock<Firewall>>>,
) -> Json<crate::models::FirewallStatus> {
    let firewall = firewall.read().await;
    let status = firewall.get_status().await;
    Json(status)
}

/// Get firewall statistics
pub async fn get_statistics(
    State(firewall): State<Arc<RwLock<Firewall>>>,
) -> Json<crate::models::FirewallStatistics> {
    let firewall = firewall.read().await;
    let stats = firewall.get_statistics().await;
    Json(stats)
}

/// Toggle firewall enabled/disabled state
pub async fn toggle_firewall(
    State(firewall): State<Arc<RwLock<Firewall>>>,
) -> (StatusCode, Json<serde_json::Value>) {
    let mut firewall = firewall.write().await;
    let current_status = firewall.get_status().await;
    if current_status.enabled {
        firewall.disable().await;
        (StatusCode::OK, Json(json!({ "message": "Firewall disabled", "status": "disabled" })))
    } else {
        firewall.enable().await;
        (StatusCode::OK, Json(json!({ "message": "Firewall enabled", "status": "enabled" })))
    }
}

/// Serve the dashboard HTML
pub async fn serve_dashboard() -> Html<&'static str> {
    Html(include_str!("../static/dashboard.html"))
} 