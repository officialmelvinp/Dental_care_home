const Service = require("../models/Service");



exports.createService = async (req, res) => {
  try {
    const { name, price, unit, requiresConsultation } = req.body;

    if (!name || price === undefined){
      return res.status(400).json({
        message: "Name and price are required",
      });
    }

    const service = await Service.create({
      name,
      price,
      unit,
      requiresConsultation,
    });

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};


exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.name = req.body.name || service.name;
    service.price =
      req.body.price !== undefined ? req.body.price : service.price;
    service.unit = req.body.unit || service.unit;
    service.isOnlineBookable =
      req.body.isOnlineBookable !== undefined
        ? req.body.isOnlineBookable
        : service.isOnlineBookable;

    const updatedService = await service.save();

    res.json({
      message: "Service updated successfully",
      updatedService,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update service",
      error: error.message,
    });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await service.deleteOne();

    res.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

