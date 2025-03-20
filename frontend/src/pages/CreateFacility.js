import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function CreateFacility() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Hospital',
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    contactPhone: '',
    contactEmail: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [facilityId, setFacilityId] = useState('');
  
  const navigate = useNavigate();

  const { 
    name, 
    type, 
    address, 
    city, 
    district, 
    state, 
    pincode, 
    contactPhone, 
    contactEmail 
  } = formData;

  const facilityTypes = [
    'Hospital', 
    'Primary Health Center', 
    'Community Health Center', 
    'Sub-district Hospital', 
    'District Hospital', 
    'Medical College', 
    'Department'
  ];

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      // Simple validation
      if (!name || !type || !district || !state) {
        toast.error('Please fill all required fields');
        setIsLoading(false);
        return;
      }

      if (pincode && !/^[0-9]{6}$/.test(pincode)) {
        toast.error('Pincode must be a 6-digit number');
        setIsLoading(false);
        return;
      }

      // Call the API to create facility
      const response = await axios.post('/api/facilities', formData);
      
      if (response.data && response.data.success) {
        toast.success('Facility created successfully');
        setFacilityId(response.data.data._id);
        
        // Reset form
        setFormData({
          name: '',
          type: 'Hospital',
          address: '',
          city: '',
          district: '',
          state: '',
          pincode: '',
          contactPhone: '',
          contactEmail: '',
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create facility';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Health Data Management System</h1>
        <h2>Create Facility</h2>
        <p className="description">
          Create a facility first, then use the facility ID to register as a Hospital Admin or Department User.
        </p>
        
        {facilityId && (
          <div className="alert alert-success">
            <h3>Facility Created!</h3>
            <p>Facility ID: <strong>{facilityId}</strong></p>
            <p>Use this ID when registering as a Hospital Admin or Department User.</p>
            <button 
              className="btn btn-sm" 
              onClick={() => {navigator.clipboard.writeText(facilityId); toast.info('Facility ID copied to clipboard');}}
            >
              Copy ID
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              Register Now
            </button>
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Facility Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              placeholder="Enter facility name"
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Facility Type*</label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={onChange}
              required
            >
              {facilityTypes.map((facilityType) => (
                <option key={facilityType} value={facilityType}>
                  {facilityType}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              placeholder="Enter address"
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={city}
              placeholder="Enter city"
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="district">District*</label>
            <input
              type="text"
              id="district"
              name="district"
              value={district}
              placeholder="Enter district"
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="state">State*</label>
            <input
              type="text"
              id="state"
              name="state"
              value={state}
              placeholder="Enter state"
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pincode">Pincode</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={pincode}
              placeholder="Enter 6-digit pincode"
              onChange={onChange}
              pattern="[0-9]{6}"
              title="Pincode must be a 6-digit number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPhone">Contact Phone</label>
            <input
              type="text"
              id="contactPhone"
              name="contactPhone"
              value={contactPhone}
              placeholder="Enter contact phone"
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={contactEmail}
              placeholder="Enter contact email"
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Facility'}
            </button>
          </div>
        </form>
        <div className="register-link">
          <p>
            Already have a Facility ID? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreateFacility; 