class PaymentProcessor:
    def Process(self, user_context):
        if user_context is None:
            raise Exception("User context is null")
        # Rest of the Process method implementation

class MobileApp:
    def Submit(self):
        payment_processor = PaymentProcessor()
        user_context = None  # Intentionally setting user_context to None
        payment_processor.Process(user_context)

app = MobileApp()
try:
    app.Submit()
except Exception as e:
    print(e)
```

This script will intentionally cause a `NullReferenceException` (or equivalent in Python, `Exception`) when trying to call `app.Submit()`, reproducing the failure described in the bug report.