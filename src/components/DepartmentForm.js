import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

function DepartmentForm({ department, onSuccess }) {
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    facility: user?.facility || '',
    description: '',
    head: {
      name: '',
      designation: '',
      contactNumber: '',
      email: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If editing, populate form with department data
    if (department) {
      setFormData({
        name: department.name || '',
        facility: department.facility?._id || department.facility || '',
        description: department.description || '',
        head: {
          name: department.head?.name || '',
          designation: department.head?.designation || '',
          contactNumber: department.head?.contactNumber || '',
          email: department.head?.email || ''
        }
      });
    }
  }, [department]);

  const onChange = (e) => {
    if (e.target.name.includes('head.')) {
      const headField = e.target.name.split('.')[1];
      setFormData((prevState) => ({
        ...prevState,
        head: {
          ...prevState.head,
          [headField]: e.target.value
        }
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validation
      if (!formData.name) {
        toast.error('Department name is required');
        setIsLoading(false);
        return;
      }

      if (!formData.facility) {
        toast.error('Facility is required');
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      let response;
      
      if (department) {
        // Update existing department
        response = await axios.put(`/api/departments/${department._id}`, formData, config);
        toast.success('Department updated successfully');
      } else {
        // Create new department
        response = await axios.post('/api/departments', formData, config);
        toast.success('Department created successfully');
      }

      // Call the success handler
      if (onSuccess) {
        onSuccess(response.data.data);
      }

      // Reset form if creating new
      if (!department) {
        setFormData({
          name: '',
          facility: user?.facility || '',
          description: '',
          head: {
            name: '',
            designation: '',
            contactNumber: '',
            email: ''
          }
        });
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save department';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="name">Department Name*</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Enter department name"
          required
        />
      </div>
      
      {!user?.facility && (
        <div className="form-group">
          <label htmlFor="facility">Facility ID*</label>
          <input
            type="text"
            id="facility"
            name="facility"
            value={formData.facility}
            onChange={onChange}
            placeholder="Enter facility ID"
            required
            pattern="^[0-9a-fA-F]{24}$"
            title="Must be a valid 24-character MongoDB ObjectId"
          />
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Enter department description"
          rows="3"
        />
      </div>
      
      <h3>Department Head</h3>
      
      <div className="form-group">
        <label htmlFor="head.name">Head Name</label>
        <input
          type="text"
          id="head.name"
          name="head.name"
          value={formData.head.name}
          onChange={onChange}
          placeholder="Enter head's name"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="head.designation">Designation</label>
        <input
          type="text"
          id="head.designation"
          name="head.designation"
          value={formData.head.designation}
          onChange={onChange}
          placeholder="Enter designation"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="head.contactNumber">Contact Number</label>
        <input
          type="text"
          id="head.contactNumber"
          name="head.contactNumber"
          value={formData.head.contactNumber}
          onChange={onChange}
          placeholder="Enter contact number"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="head.email">Email</label>
        <input
          type="email"
          id="head.email"
          name="head.email"
          value={formData.head.email}
          onChange={onChange}
          placeholder="Enter email"
        />
      </div>
      
      <div className="form-group">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
        </button>
      </div>
    </form>
  );
}

export default DepartmentForm; 