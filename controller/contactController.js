const Contact = require("../models/contactModel");

//add contact details
exports.createContact = async (req, res, next) => {
  try {
    const user = new Contact(req.body);
    const createContact = await user.save();
    res.status(201).json({ success: true, createContact });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

// get all contact details(Admin)
exports.getAllContacts = async (req, res, next) => {
  try {
    const contactData = await Contact.find();
    res.status(201).json({ success: true, contactData });
  } catch (e) {
    res.status(400).json({ success: false, e });
  }
};

//update replied status(no -> yes)
exports.updateStatus = async (req, res, next) => {
  try {
    const updateContactStatus = await Contact.findByIdAndUpdate(
      req.params.id,
      { repliedStatus: true },
      { new: true }
    );
    if (!updateContactStatus) {
      return res.json({ success: false, error: "Contact not found" });
    }
    res.json({ success: true, updateContactStatus });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
