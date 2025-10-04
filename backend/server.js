const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// Example endpoint
app.get("/", (req, res) => {
  res.send("Clutter2Cash is running sdfasdfasd");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
