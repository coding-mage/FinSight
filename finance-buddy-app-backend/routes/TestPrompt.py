import requests
import json
import time
from requests.auth import HTTPBasicAuth

# Your REST API endpoint
url = "https://your-api-endpoint.com/api/query"

# Your credentials
username = "your_username"
password = "your_password"

# List of queries
queries = [
    "Show me the distribution of transactions for each process name that has assignees name like 'Meg Fitzimmons'",
    "Show me the distribution of transactions for each status that has assignees name like 'Meg Fitzimmons'",
    "Show me the distribution of transactions for each status that has assignees name like 'Veda Moss'",
    "Show me the distribution of transactions for each process name that were submitted in last 7 days",
    "Show me the distribution of transactions for each process name that has assignees name like 'Meg Fitzimmons' and was submitted in last 15 days",
    "Show me the distribution of transactions with respect to each status that has assignees name like 'Meg Fitzimmons' and was submitted in last 15 days and belonging to process 'Additional Assignment Info'",
    "Show me the distribution of count of transactions for all process name that has assignees name like 'Veda Moss' and was submitted in last 15 days and belonging to 'PENDING' status",
    "show me the count of transactions for top 10 processes that are submitted in last 10 days",
    "Show me the weekly distribution of transactions that were created for each process name and sort them on week basis in descending order",
    "show me the top 2 process names with most number of transactions that are created for each week",
    "show me on an average how much time does a transaction takes to reach COMPLETED status for each process name. make sure you round the time and sort by time in descending order.",
    "Show me the distribution of process name with respect to the average time it takes for a transaction to reach COMPLETED state and sort them by descending order of time",
    "show me how many transactions are assigned to each user (display names) for each process names, which are in PENDING status. Please do not include null assignees. Please sort the data in descending order of count.",
    "Show me the distribution of transaction accross all status",
    "Show me the distribution of transactions for PENDING Status accross all process names",
    "Show me the distribution of transactions with respect to each process name",
    "Show me the distribution of transactions with respect to each process name and are submitted in last 30 days",
    "Show me the distribution of transactions with respect to each process name and are submitted in last 30 days and submitted by 'HCM_USER2'",
    "Show me the distribution of transactions with respect to each process name and are submitted in last 30 days and submitted by 'HCM_USER2' and assigned to user 'Veda Moss'",
    "Show me the distribution of transactions with respect to each process name and are submitted in last 30 days and submitted by 'HCM_USER2' and assigned to user 'Veda Moss' order by count",
    "show me the transaction count week wise for last 50 days for process name as Create Grade that are assigned to 'Veda Moss' and created by 'HCM_USER2'"
]

# Store all responses
responses = []

for query in queries:
    payload = {
        "inputDetails": {
            "aiQueryString": query
        }
    }

    try:
        response = requests.post(
            url,
            json=payload,
            auth=HTTPBasicAuth('vmoss', 'Welcome1'),
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        data = response.json()
        responses.append(data)
        print(f"✅ Success: {query}\n{json.dumps(data, indent=2)}\n")
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed: {query}\n{e}\n")

    time.sleep(1)  # Optional delay between requests

# Save responses to file
with open("query_responses1.json", "w") as f:
    json.dump(responses, f, indent=2)

print("✅ All queries completed and responses saved.")
