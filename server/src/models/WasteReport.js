const mongoose = require("mongoose");

const wasteReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    wasteType: {
      type: String,
      enum: ["dry", "wet", "ewaste"],
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

wasteReportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("WasteReport", wasteReportSchema);
