use jsonwebtoken::{decode, Validation, DecodingKey};
use serde_json::Value;

pub async fn extract_user_id(token: String) -> String {
    let validation = Validation::default();
    let decoded = decode::<Value>(
        &token,
        &DecodingKey::from_secret(validation.secret.as_ref()),
        &validation.algorithms,
    )
    .await;

    match decoded {
        Ok(data) => data
            .claims
            .get("userId")
            .unwrap_or(&Value::String("".to_string()))
            .as_str()
            .unwrap_or("")
            .to_string(),
        Err(_) => "".to_string(),
    }
}