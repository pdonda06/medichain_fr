import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../features/auth/authSlice';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'department-user',
    facility: '',
    district: '',
    state: '',
  });

  const { name, email, password, password2, role, facility, district, state } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // List of available roles
  const roles = [
    { value: 'department-user', label: 'Department User' },
    { value: 'hospital-admin', label: 'Hospital Admin' },
    { value: 'district-admin', label: 'District Admin' },
    { value: 'state-admin', label: 'State Admin' }
    // Super admin role is not available for regular registration
  ];

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    // Redirect when logged in
    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const validateObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate facility ID if required
    if ((role === 'hospital-admin' || role === 'department-user') && !validateObjectId(facility)) {
      toast.error('Facility ID must be a valid 24-character hexadecimal MongoDB ID');
      return;
    }

    const userData = {
      name,
      email,
      password,
      role,
      facility: role === 'hospital-admin' || role === 'department-user' ? facility : undefined,
      district: ['district-admin', 'hospital-admin', 'department-user'].includes(role) ? district : undefined,
      state: ['state-admin', 'district-admin', 'hospital-admin', 'department-user'].includes(role) ? state : undefined,
    };

    dispatch(register(userData));
  };

  // Function to determine which fields to show based on role
  const shouldShowField = (fieldName) => {
    switch (fieldName) {
      case 'facility':
        return role === 'hospital-admin' || role === 'department-user';
      case 'district':
        return ['district-admin', 'hospital-admin', 'department-user'].includes(role);
      case 'state':
        return ['state-admin', 'district-admin', 'hospital-admin', 'department-user'].includes(role);
      default:
        return true;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Health Data Management System</h1>
        <h2>Register</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              placeholder="Enter your name"
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={onChange}
              required
            >
              {roles.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
          </div>
          
          {shouldShowField('state') && (
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={state}
                placeholder="Enter your state"
                onChange={onChange}
                required={shouldShowField('state')}
              />
            </div>
          )}
          
          {shouldShowField('district') && (
            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                type="text"
                id="district"
                name="district"
                value={district}
                placeholder="Enter your district"
                onChange={onChange}
                required={shouldShowField('district')}
              />
            </div>
          )}
          
          {shouldShowField('facility') && (
            <div className="form-group">
              <label htmlFor="facility">Facility ID</label>
              <input
                type="text"
                id="facility"
                name="facility"
                value={facility}
                placeholder="Enter valid MongoDB ObjectId of existing facility"
                onChange={onChange}
                required={shouldShowField('facility')}
                pattern="^[0-9a-fA-F]{24}$"
                title="Must be a valid 24-character MongoDB ObjectId"
              />
              <small className="form-text">
                Must be a valid 24-character MongoDB ObjectId. A facility must exist in the database first.
              </small>
              <div className="register-link">
                <p>
                  Don't have a Facility ID? <Link to="/create-facility">Create a Facility</Link>
                </p>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              placeholder="Enter password"
              onChange={onChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              placeholder="Confirm password"
              onChange={onChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </div>
        </form>
        <div className="register-link">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register; 