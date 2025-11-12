# 🚀 How to Start the TulongAral+ Server

## Quick Start Command

```powershell
cd c:\Users\JAXXT\Videos\Codes\dd\SoftEng
node server.js
```

OR from the parent directory:

```powershell
cd c:\Users\JAXXT\Videos\Codes\dd
node SoftEng/server.js
```

---

## Step-by-Step Instructions

### 1. Open PowerShell or Terminal
- Press `Windows + X` and select "Windows PowerShell" or "Terminal"

### 2. Navigate to the SoftEng directory
```powershell
cd c:\Users\JAXXT\Videos\Codes\dd\SoftEng
```

### 3. Start the server
```powershell
node server.js
```

### 4. Verify the server is running
You should see:
```
╔═══════════════════════════════════════════════════╗
║         TulongAral+ Server Running                ║
║                                                   ║
║   🚀 Server: http://localhost:5000              ║
║   📁 API: http://localhost:5000/api             ║
║   🗄️  Database: MongoDB Connected                 ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

### 5. Access the application
Open your browser and go to: **http://localhost:5000**

---

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

---

## Troubleshooting

### If port 5000 is already in use:
```powershell
# Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Then start the server again
node server.js
```

### If MongoDB connection fails:
- Check your `.env` file has the correct `MONGODB_URI`
- Ensure your MongoDB Atlas cluster is running
- Verify your IP address is whitelisted in MongoDB Atlas

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `node server.js` | Start the server |
| `Ctrl + C` | Stop the server |
| `Get-Process -Name node \| Stop-Process -Force` | Kill all Node processes |
| `cd c:\Users\JAXXT\Videos\Codes\dd\SoftEng` | Navigate to project |

---

**Server URL:** http://localhost:5000  
**Server Port:** 5000  
**Database:** MongoDB Atlas
