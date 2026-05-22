use std::collections::HashSet;
use std::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    cancelled_jobs: Mutex<HashSet<String>>,
}

impl AppState {
    pub fn cancel(&self, job_id: &str) -> Result<(), String> {
        self.cancelled_jobs
            .lock()
            .map_err(|_| "Failed to lock cancellation state".to_string())?
            .insert(job_id.to_string());
        Ok(())
    }

    pub fn clear(&self, job_id: &str) -> Result<(), String> {
        self.cancelled_jobs
            .lock()
            .map_err(|_| "Failed to lock cancellation state".to_string())?
            .remove(job_id);
        Ok(())
    }

    pub fn is_cancelled(&self, job_id: &str) -> Result<bool, String> {
        Ok(self
            .cancelled_jobs
            .lock()
            .map_err(|_| "Failed to lock cancellation state".to_string())?
            .contains(job_id))
    }
}
