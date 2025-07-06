const { pool } = require('../config/database');

// Get all patients for a doctor
const getPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const [patients] = await pool.execute(
      `SELECT 
        p.id, p.name, p.email, p.age, p.status, p.risk_level,
        p.created_at, p.last_activity,
        COUNT(a.id) as total_analyses,
        AVG(a.score) as avg_score
      FROM patients p
      LEFT JOIN analyses a ON p.id = a.patient_id
      WHERE p.doctor_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [doctorId]
    );

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get specific patient
const getPatientById = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const patientId = req.params.id;

    const [patients] = await pool.execute(
      'SELECT * FROM patients WHERE id = ? AND doctor_id = ?',
      [patientId, doctorId]
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patients[0]);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get patient analyses
const getPatientAnalyses = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const patientId = req.params.id;

    // Verify patient belongs to doctor
    const [patients] = await pool.execute(
      'SELECT id FROM patients WHERE id = ? AND doctor_id = ?',
      [patientId, doctorId]
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const [analyses] = await pool.execute(
      'SELECT * FROM analyses WHERE patient_id = ? ORDER BY created_at DESC',
      [patientId]
    );

    res.json(analyses);
  } catch (error) {
    console.error('Get patient analyses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new patient
const createPatient = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { name, email, age } = req.body;

    // Check if patient already exists
    const [existingPatients] = await pool.execute(
      'SELECT id FROM patients WHERE email = ? AND doctor_id = ?',
      [email, doctorId]
    );

    if (existingPatients.length > 0) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    const [result] = await pool.execute(
      'INSERT INTO patients (doctor_id, name, email, age) VALUES (?, ?, ?, ?)',
      [doctorId, name, email, age]
    );

    const [newPatient] = await pool.execute(
      'SELECT * FROM patients WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Patient created successfully',
      patient: newPatient[0]
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const patientId = req.params.id;
    const { name, email, age, status, risk_level } = req.body;

    // Verify patient belongs to doctor
    const [patients] = await pool.execute(
      'SELECT id FROM patients WHERE id = ? AND doctor_id = ?',
      [patientId, doctorId]
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if email is taken by another patient
    if (email) {
      const [existingPatients] = await pool.execute(
        'SELECT id FROM patients WHERE email = ? AND doctor_id = ? AND id != ?',
        [email, doctorId, patientId]
      );

      if (existingPatients.length > 0) {
        return res.status(400).json({ message: 'Email already taken by another patient' });
      }
    }

    // Update patient
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (age) {
      updateFields.push('age = ?');
      updateValues.push(age);
    }

    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (risk_level) {
      updateFields.push('risk_level = ?');
      updateValues.push(risk_level);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(patientId);

    await pool.execute(
      `UPDATE patients SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [updatedPatient] = await pool.execute(
      'SELECT * FROM patients WHERE id = ?',
      [patientId]
    );

    res.json({
      message: 'Patient updated successfully',
      patient: updatedPatient[0]
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  getPatientAnalyses,
  createPatient,
  updatePatient
}; 