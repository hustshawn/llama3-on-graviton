from locust import HttpUser, task, between


class APIUser(HttpUser):
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks

    @task
    def chat_completion(self):
        headers = {"Content-Type": "application/json"}

        payload = {
            "model": "any-model",
            "messages": [
                {
                    "role": "user",
                    "content": "Building a visually appealing website can be done in ten detailed steps:",
                }
            ],
            "max_tokens": 512,
            "temperature": 0.7,
        }

        # This corresponds to the curl endpoint
        self.client.post("/v1/chat/completions", json=payload, headers=headers)
