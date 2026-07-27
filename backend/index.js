const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const futsalRoutes = require("./routes/futsalRoutes");
const courtRoutes = require("./routes/courtRoutes");
const slotRoutes = require("./routes/slotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");
const recommendRoutes = require("./routes/recommendRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/futsals", futsalRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin-settings", adminSettingsRoutes);
app.use("/api/recommend", recommendRoutes);


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
