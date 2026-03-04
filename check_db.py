import urllib.request, json, ssl, os

MONGODB_URI = "mongodb+srv://Adityas3111N:0Ok0ZbOP01pIxEzS@cluster0.knolz.mongodb.net/mailapply?retryWrites=true&w=majority"

try:
    from pymongo import MongoClient
    client = MongoClient(MONGODB_URI)
    db = client["mailapply"]
    user = db["users"].find_one({"email": "singhaditya4333@gmail.com"}, {
        "email": 1, "gmailRefreshToken": 1, "gmailAccessToken": 1, "gmailTokenExpiry": 1
    })
    if user:
        print("User found:")
        print(f"  gmailRefreshToken: {'SET (' + str(len(user.get('gmailRefreshToken',''))) + ' chars)' if user.get('gmailRefreshToken') else 'NOT SET / EMPTY'}")
        print(f"  gmailAccessToken:  {'SET' if user.get('gmailAccessToken') else 'NOT SET / EMPTY'}")
        print(f"  gmailTokenExpiry:  {user.get('gmailTokenExpiry', 'NOT SET')}")
    else:
        print("User NOT found in DB")
    client.close()
except ImportError:
    print("pymongo not installed. Run: pip install pymongo[srv]")
except Exception as e:
    print(f"Error: {e}")
