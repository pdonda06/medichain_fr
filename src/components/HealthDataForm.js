import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

function HealthDataForm({ report, onSuccess }) {
  const { user } = useSelector((state) => state.auth);
  
  const [departments, setDepartments] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  
  // Initialize form with a structure that matches the HealthData model
  const [formData, setFormData] = useState(() => {
    // Default form structure
    const defaultForm = {
      facility: user?.facility || '',
      department: '',
      reportingPeriod: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        quarter: Math.ceil((new Date().getMonth() + 1) / 3)
      },
      status: 'draft',
      healthData: {
        maternalHealth: {
          antenatalRegistrations: 0,
          institutionalDeliveries: 0,
          homeDeliveries: 0,
          maternalDeaths: 0,
          highRiskPregnancies: 0
        },
        childHealth: {
          newbornRegistered: 0,
          fullImmunization: 0,
          lowBirthWeight: 0,
          childDeaths: 0,
          malnutritionCases: 0
        },
        diseaseControl: {
          tbCasesDetected: 0,
          tbCasesTreated: 0,
          malariaPositive: 0,
          denguePositive: 0,
          hivTestedPositive: 0
        },
        outpatientServices: {
          totalOPDVisits: 0,
          maleVisits: 0,
          femaleVisits: 0,
          childrenVisits: 0,
          referralsOut: 0
        },
        inpatientServices: {
          totalAdmissions: 0,
          totalDischarges: 0,
          averageLengthOfStay: 0,
          bedOccupancyRate: 0,
          totalDeaths: 0
        },
        surgicalProcedures: {
          majorSurgeries: 0,
          minorSurgeries: 0,
          emergencySurgeries: 0,
          electiveSurgeries: 0,
          surgicalComplications: 0
        },
        familyPlanning: {
          condomsDistributed: 0,
          oralPillsCycles: 0,
          iudInsertions: 0,
          sterilizationProcedures: 0,
          injectableContraceptives: 0
        },
        laboratoryServices: {
          totalLabTests: 0,
          bloodTestsPerformed: 0,
          urineTestsPerformed: 0,
          pathologyTests: 0,
          radiologyTests: 0
        },
        resources: {
          doctorsAvailable: 0,
          nursesAvailable: 0,
          paramedicStaff: 0,
          totalBeds: 0,
          operationalBeds: 0
        }
      },
      notes: ''
    };
    
    // If we have a report to edit, populate it, but we'll do that in useEffect
    return defaultForm;
  });

  useEffect(() => {
    // Fetch departments and facilities if needed
    if (user.role === 'department-user' && user.department) {
      fetchDepartment();
    }
    
    if (user.role === 'super-admin' || user.role === 'state-admin' || user.role === 'district-admin' || user.role === 'hospital-admin') {
      fetchFacilities();
      
      // If hospital admin, initialize with their facility and fetch departments
      if (user.role === 'hospital-admin' && user.facility) {
        setFormData(prev => ({
          ...prev,
          facility: user.facility
        }));
        fetchDepartmentsForFacility(user.facility);
      }
    }
    
    // If editing an existing report, populate the form
    if (report) {
      populateFormWithReport(report);
    }
  }, [user]);

  // When facility changes, fetch departments for that facility
  useEffect(() => {
    if (formData.facility) {
      fetchDepartmentsForFacility(formData.facility);
    }
  }, [formData.facility]);

  const fetchFacilities = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      // Filter facilities based on user role
      let url = '/api/facilities';
      if (user.role === 'hospital-admin' && user.facility) {
        url += `?_id=${user.facility}`;
      } else if (user.role === 'district-admin') {
        url += `?district=${user.district}`;
      } else if (user.role === 'state-admin') {
        url += `?state=${user.state}`;
      }

      const response = await axios.get(url, config);
      setFacilities(response.data.data);
      
      // If only one facility and none selected yet, auto-select it
      if (response.data.data.length === 1 && !formData.facility) {
        const facilityId = response.data.data[0]._id;
        setFormData(prev => ({
          ...prev,
          facility: facilityId
        }));
        fetchDepartmentsForFacility(facilityId);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to fetch facilities');
    }
  };

  const fetchDepartment = async () => {
    if (user.role === 'department-user' && user.department) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        
        const response = await axios.get(`/api/departments/${user.department}`, config);
        setDepartments([response.data.data]);
        
        // Set department and facility in form
        setFormData(prevState => ({
          ...prevState,
          department: user.department,
          facility: response.data.data.facility
        }));
      } catch (error) {
        console.error('Error fetching department:', error);
        toast.error('Failed to fetch department information');
      }
    }
  };

  const fetchDepartmentsForFacility = async (facilityId) => {
    if (!facilityId) {
      setDepartments([]);
      return;
    }
    
    try {
      console.log('Fetching departments for facility:', facilityId);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(`/api/departments?facility=${facilityId}`, config);
      console.log('Departments fetched:', response.data);
      
      if (response.data.data.length === 0) {
        // If no departments found, try to create a default one
        try {
          console.log('No departments found, creating a default department');
          const defaultDept = {
            name: 'General Department',
            facility: facilityId,
            description: 'Default department'
          };
          
          const createResponse = await axios.post('/api/departments', defaultDept, config);
          console.log('Created default department:', createResponse.data);
          
          // Set departments array with the newly created department
          setDepartments([createResponse.data.data]);
          
          // Auto-select the new department
          setFormData(prev => ({
            ...prev,
            department: createResponse.data.data._id
          }));
        } catch (createError) {
          console.error('Error creating default department:', createError);
          toast.error('Failed to create default department');
        }
      } else {
        setDepartments(response.data.data);
        
        // Auto-select department if only one exists and none selected
        if (response.data.data.length === 1 && !formData.department) {
          setFormData(prev => ({
            ...prev,
            department: response.data.data[0]._id
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching departments for facility:', error);
      toast.error('Failed to fetch departments');
    }
  };

  const populateFormWithReport = (report) => {
    const formattedReport = {
      ...report,
      facility: report.facility?._id || report.facility,
      department: report.department?._id || report.department,
      // Ensure all health data fields exist
      healthData: {
        maternalHealth: {
          antenatalRegistrations: report.healthData?.maternalHealth?.antenatalRegistrations || 0,
          institutionalDeliveries: report.healthData?.maternalHealth?.institutionalDeliveries || 0,
          homeDeliveries: report.healthData?.maternalHealth?.homeDeliveries || 0,
          maternalDeaths: report.healthData?.maternalHealth?.maternalDeaths || 0,
          highRiskPregnancies: report.healthData?.maternalHealth?.highRiskPregnancies || 0
        },
        childHealth: {
          newbornRegistered: report.healthData?.childHealth?.newbornRegistered || 0,
          fullImmunization: report.healthData?.childHealth?.fullImmunization || 0,
          lowBirthWeight: report.healthData?.childHealth?.lowBirthWeight || 0,
          childDeaths: report.healthData?.childHealth?.childDeaths || 0,
          malnutritionCases: report.healthData?.childHealth?.malnutritionCases || 0
        },
        diseaseControl: {
          tbCasesDetected: report.healthData?.diseaseControl?.tbCasesDetected || 0,
          tbCasesTreated: report.healthData?.diseaseControl?.tbCasesTreated || 0,
          malariaPositive: report.healthData?.diseaseControl?.malariaPositive || 0,
          denguePositive: report.healthData?.diseaseControl?.denguePositive || 0,
          hivTestedPositive: report.healthData?.diseaseControl?.hivTestedPositive || 0
        },
        outpatientServices: {
          totalOPDVisits: report.healthData?.outpatientServices?.totalOPDVisits || 0,
          maleVisits: report.healthData?.outpatientServices?.maleVisits || 0,
          femaleVisits: report.healthData?.outpatientServices?.femaleVisits || 0,
          childrenVisits: report.healthData?.outpatientServices?.childrenVisits || 0,
          referralsOut: report.healthData?.outpatientServices?.referralsOut || 0
        },
        inpatientServices: {
          totalAdmissions: report.healthData?.inpatientServices?.totalAdmissions || 0,
          totalDischarges: report.healthData?.inpatientServices?.totalDischarges || 0,
          averageLengthOfStay: report.healthData?.inpatientServices?.averageLengthOfStay || 0,
          bedOccupancyRate: report.healthData?.inpatientServices?.bedOccupancyRate || 0,
          totalDeaths: report.healthData?.inpatientServices?.totalDeaths || 0
        },
        surgicalProcedures: {
          majorSurgeries: report.healthData?.surgicalProcedures?.majorSurgeries || 0,
          minorSurgeries: report.healthData?.surgicalProcedures?.minorSurgeries || 0,
          emergencySurgeries: report.healthData?.surgicalProcedures?.emergencySurgeries || 0,
          electiveSurgeries: report.healthData?.surgicalProcedures?.electiveSurgeries || 0,
          surgicalComplications: report.healthData?.surgicalProcedures?.surgicalComplications || 0
        },
        familyPlanning: {
          condomsDistributed: report.healthData?.familyPlanning?.condomsDistributed || 0,
          oralPillsCycles: report.healthData?.familyPlanning?.oralPillsCycles || 0,
          iudInsertions: report.healthData?.familyPlanning?.iudInsertions || 0,
          sterilizationProcedures: report.healthData?.familyPlanning?.sterilizationProcedures || 0,
          injectableContraceptives: report.healthData?.familyPlanning?.injectableContraceptives || 0
        },
        laboratoryServices: {
          totalLabTests: report.healthData?.laboratoryServices?.totalLabTests || 0,
          bloodTestsPerformed: report.healthData?.laboratoryServices?.bloodTestsPerformed || 0,
          urineTestsPerformed: report.healthData?.laboratoryServices?.urineTestsPerformed || 0,
          pathologyTests: report.healthData?.laboratoryServices?.pathologyTests || 0,
          radiologyTests: report.healthData?.laboratoryServices?.radiologyTests || 0
        },
        resources: {
          doctorsAvailable: report.healthData?.resources?.doctorsAvailable || 0,
          nursesAvailable: report.healthData?.resources?.nursesAvailable || 0,
          paramedicStaff: report.healthData?.resources?.paramedicStaff || 0,
          totalBeds: report.healthData?.resources?.totalBeds || 0,
          operationalBeds: report.healthData?.resources?.operationalBeds || 0
        }
      },
      notes: report.notes || ''
    };
    
    setFormData(formattedReport);
    
    // Fetch departments for the facility
    if (formattedReport.facility) {
      fetchDepartmentsForFacility(formattedReport.facility);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const parts = name.split('.');
      
      if (parts.length === 2) {
        // Two level nesting (e.g., reportingPeriod.year)
        setFormData(prevState => ({
          ...prevState,
          [parts[0]]: {
            ...prevState[parts[0]],
            [parts[1]]: parts[0] === 'reportingPeriod' ? parseInt(value) : value
          }
        }));
      } else if (parts.length === 3) {
        // Three level nesting (e.g., healthData.maternalHealth.antenatalRegistrations)
        setFormData(prevState => {
          // Ensure healthData exists
          const healthData = prevState.healthData || {};
          // Ensure the category exists (e.g., maternalHealth)
          const category = healthData[parts[1]] || {};
          
          return {
            ...prevState,
            healthData: {
              ...healthData,
              [parts[1]]: {
                ...category,
                [parts[2]]: parseInt(value)
              }
            }
          };
        });
      }
    } else {
      // Simple field
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validation
      if (!formData.facility) {
        toast.error('Facility is required');
        setIsLoading(false);
        return;
      }
      
      if (!formData.department) {
        toast.error('Department is required');
        setIsLoading(false);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('Submitting form data:', formData);
      
      let response;
      
      try {
        if (report) {
          // Update existing report
          response = await axios.put(`/api/health-data/${report._id}`, formData, config);
          console.log('Updated report response:', response.data);
          toast.success('Report updated successfully');
        } else {
          // Create new report
          response = await axios.post('/api/health-data', formData, config);
          console.log('Created report response:', response.data);
          toast.success('Report created successfully');
        }
        
        // Call success handler
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        console.error('API Error Response:', apiError.response);
        throw apiError;
      }
    } catch (error) {
      console.error('Error saving report:', error);
      const message = error.response?.data?.error || 'Failed to save report';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusOptions = () => {
    // Different status options based on user role and current status
    const options = [
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Submitted' }
    ];
    
    // Higher level admins can approve/reject
    if (['super-admin', 'state-admin', 'district-admin'].includes(user.role)) {
      options.push(
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      );
    }
    
    return options;
  };

  const createNewDepartment = async (e) => {
    e.preventDefault();
    
    if (!newDeptName.trim()) {
      toast.error('Department name is required');
      return;
    }
    
    if (!formData.facility) {
      toast.error('Please select a facility first');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const departmentData = {
        name: newDeptName,
        facility: formData.facility,
        description: `${newDeptName} Department`
      };
      
      const response = await axios.post('/api/departments', departmentData, config);
      console.log('Created department:', response.data);
      
      // Add the new department to the existing departments
      setDepartments([...departments, response.data.data]);
      
      // Select the new department
      setFormData(prev => ({
        ...prev,
        department: response.data.data._id
      }));
      
      // Reset states
      setNewDeptName('');
      setShowCreateDept(false);
      
      toast.success('Department created successfully');
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="health-data-form">
      <div className="form-section">
        <h3>Report Information</h3>
        
        <div className="form-row">
          {(!user.facility || ['super-admin', 'state-admin', 'district-admin'].includes(user.role)) && (
            <div className="form-group">
              <label htmlFor="facility">Facility*</label>
              <select
                id="facility"
                name="facility"
                value={formData.facility}
                onChange={onChange}
                required
                disabled={report && report.status !== 'draft'}
              >
                <option value="">Select Facility</option>
                {facilities.map(facility => (
                  <option key={facility._id} value={facility._id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="department">Department*</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={onChange}
              required
              disabled={report && report.status !== 'draft' || departments.length === 0}
            >
              <option value="">Select Department</option>
              {departments.length > 0 ? (
                departments.map(department => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading departments...</option>
              )}
            </select>
            
            {departments.length === 0 && formData.facility && (
              <p className="form-text">No departments available for this facility. Creating a default department...</p>
            )}
            
            {formData.facility && !showCreateDept && (
              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => setShowCreateDept(true)}
                style={{ marginTop: '10px' }}
              >
                + Add New Department
              </button>
            )}
            
            {formData.facility && showCreateDept && (
              <div className="create-department-form" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h4>Create New Department</h4>
                <div className="form-row">
                  <div className="form-group" style={{ flex: '2' }}>
                    <input
                      type="text"
                      placeholder="Department Name"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn btn-sm" 
                      onClick={createNewDepartment}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm" 
                      onClick={() => {
                        setShowCreateDept(false);
                        setNewDeptName('');
                      }}
                      style={{ backgroundColor: '#6c757d' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reportingPeriod.year">Year*</label>
            <input
              type="number"
              id="reportingPeriod.year"
              name="reportingPeriod.year"
              value={formData.reportingPeriod.year}
              onChange={onChange}
              min="2000"
              max="2100"
              required
              disabled={report && report.status !== 'draft'}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reportingPeriod.month">Month*</label>
            <select
              id="reportingPeriod.month"
              name="reportingPeriod.month"
              value={formData.reportingPeriod.month}
              onChange={onChange}
              required
              disabled={report && report.status !== 'draft'}
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="reportingPeriod.quarter">Quarter</label>
            <select
              id="reportingPeriod.quarter"
              name="reportingPeriod.quarter"
              value={formData.reportingPeriod.quarter}
              onChange={onChange}
              disabled={report && report.status !== 'draft'}
            >
              <option value="1">Q1 (Jan-Mar)</option>
              <option value="2">Q2 (Apr-Jun)</option>
              <option value="3">Q3 (Jul-Sep)</option>
              <option value="4">Q4 (Oct-Dec)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status*</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onChange}
              required
            >
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Always show Maternal Health for all users */}
      <div className="form-section">
        <h3>Maternal Health</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="healthData.maternalHealth.antenatalRegistrations">Antenatal Registrations</label>
            <input
              type="number"
              id="healthData.maternalHealth.antenatalRegistrations"
              name="healthData.maternalHealth.antenatalRegistrations"
              value={formData.healthData.maternalHealth.antenatalRegistrations}
              onChange={onChange}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="healthData.maternalHealth.institutionalDeliveries">Institutional Deliveries</label>
            <input
              type="number"
              id="healthData.maternalHealth.institutionalDeliveries"
              name="healthData.maternalHealth.institutionalDeliveries"
              value={formData.healthData.maternalHealth.institutionalDeliveries}
              onChange={onChange}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="healthData.maternalHealth.homeDeliveries">Home Deliveries</label>
            <input
              type="number"
              id="healthData.maternalHealth.homeDeliveries"
              name="healthData.maternalHealth.homeDeliveries"
              value={formData.healthData.maternalHealth.homeDeliveries}
              onChange={onChange}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="healthData.maternalHealth.maternalDeaths">Maternal Deaths</label>
            <input
              type="number"
              id="healthData.maternalHealth.maternalDeaths"
              name="healthData.maternalHealth.maternalDeaths"
              value={formData.healthData.maternalHealth.maternalDeaths}
              onChange={onChange}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="healthData.maternalHealth.highRiskPregnancies">High Risk Pregnancies</label>
            <input
              type="number"
              id="healthData.maternalHealth.highRiskPregnancies"
              name="healthData.maternalHealth.highRiskPregnancies"
              value={formData.healthData.maternalHealth.highRiskPregnancies}
              onChange={onChange}
              min="0"
            />
          </div>
        </div>
      </div>
      
      {/* Always show Child Health for all users */}
      <div className="form-section">
        <h3>Child Health</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="healthData.childHealth.newbornRegistered">Newborn Registered</label>
            <input
              type="number"
              id="healthData.childHealth.newbornRegistered"
              name="healthData.childHealth.newbornRegistered"
              value={formData.healthData.childHealth.newbornRegistered}
              onChange={onChange}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="healthData.childHealth.fullImmunization">Full Immunization</label>
            <input
              type="number"
              id="healthData.childHealth.fullImmunization"
              name="healthData.childHealth.fullImmunization"
              value={formData.healthData.childHealth.fullImmunization}
              onChange={onChange}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="healthData.childHealth.lowBirthWeight">Low Birth Weight</label>
            <input
              type="number"
              id="healthData.childHealth.lowBirthWeight"
              name="healthData.childHealth.lowBirthWeight"
              value={formData.healthData.childHealth.lowBirthWeight}
              onChange={onChange}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="healthData.childHealth.childDeaths">Child Deaths</label>
            <input
              type="number"
              id="healthData.childHealth.childDeaths"
              name="healthData.childHealth.childDeaths"
              value={formData.healthData.childHealth.childDeaths}
              onChange={onChange}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="healthData.childHealth.malnutritionCases">Malnutrition Cases</label>
            <input
              type="number"
              id="healthData.childHealth.malnutritionCases"
              name="healthData.childHealth.malnutritionCases"
              value={formData.healthData.childHealth.malnutritionCases}
              onChange={onChange}
              min="0"
            />
          </div>
        </div>
      </div>
      
      {/* Show additional sections only for admin users */}
      {(['super-admin', 'state-admin', 'district-admin', 'hospital-admin'].includes(user.role)) && (
        <>
          <div className="form-section">
            <h3>Disease Control</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="healthData.diseaseControl.tbCasesDetected">TB Cases Detected</label>
                <input
                  type="number"
                  id="healthData.diseaseControl.tbCasesDetected"
                  name="healthData.diseaseControl.tbCasesDetected"
                  value={formData.healthData.diseaseControl.tbCasesDetected}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.diseaseControl.tbCasesTreated">TB Cases Treated</label>
                <input
                  type="number"
                  id="healthData.diseaseControl.tbCasesTreated"
                  name="healthData.diseaseControl.tbCasesTreated"
                  value={formData.healthData.diseaseControl.tbCasesTreated}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.diseaseControl.malariaPositive">Malaria Positive</label>
                <input
                  type="number"
                  id="healthData.diseaseControl.malariaPositive"
                  name="healthData.diseaseControl.malariaPositive"
                  value={formData.healthData.diseaseControl.malariaPositive}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.diseaseControl.denguePositive">Dengue Positive</label>
                <input
                  type="number"
                  id="healthData.diseaseControl.denguePositive"
                  name="healthData.diseaseControl.denguePositive"
                  value={formData.healthData.diseaseControl.denguePositive}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.diseaseControl.hivTestedPositive">HIV Tested Positive</label>
                <input
                  type="number"
                  id="healthData.diseaseControl.hivTestedPositive"
                  name="healthData.diseaseControl.hivTestedPositive"
                  value={formData.healthData.diseaseControl.hivTestedPositive}
                  onChange={onChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Outpatient Services</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="healthData.outpatientServices.totalOPDVisits">Total OPD Visits</label>
                <input
                  type="number"
                  id="healthData.outpatientServices.totalOPDVisits"
                  name="healthData.outpatientServices.totalOPDVisits"
                  value={formData.healthData.outpatientServices.totalOPDVisits}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.outpatientServices.maleVisits">Male Visits</label>
                <input
                  type="number"
                  id="healthData.outpatientServices.maleVisits"
                  name="healthData.outpatientServices.maleVisits"
                  value={formData.healthData.outpatientServices.maleVisits}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.outpatientServices.femaleVisits">Female Visits</label>
                <input
                  type="number"
                  id="healthData.outpatientServices.femaleVisits"
                  name="healthData.outpatientServices.femaleVisits"
                  value={formData.healthData.outpatientServices.femaleVisits}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.outpatientServices.childrenVisits">Children Visits</label>
                <input
                  type="number"
                  id="healthData.outpatientServices.childrenVisits"
                  name="healthData.outpatientServices.childrenVisits"
                  value={formData.healthData.outpatientServices.childrenVisits}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.outpatientServices.referralsOut">Referrals Out</label>
                <input
                  type="number"
                  id="healthData.outpatientServices.referralsOut"
                  name="healthData.outpatientServices.referralsOut"
                  value={formData.healthData.outpatientServices.referralsOut}
                  onChange={onChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Inpatient Services</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="healthData.inpatientServices.totalAdmissions">Total Admissions</label>
                <input
                  type="number"
                  id="healthData.inpatientServices.totalAdmissions"
                  name="healthData.inpatientServices.totalAdmissions"
                  value={formData.healthData.inpatientServices.totalAdmissions}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.inpatientServices.totalDischarges">Total Discharges</label>
                <input
                  type="number"
                  id="healthData.inpatientServices.totalDischarges"
                  name="healthData.inpatientServices.totalDischarges"
                  value={formData.healthData.inpatientServices.totalDischarges}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.inpatientServices.averageLengthOfStay">Average Length of Stay</label>
                <input
                  type="number"
                  id="healthData.inpatientServices.averageLengthOfStay"
                  name="healthData.inpatientServices.averageLengthOfStay"
                  value={formData.healthData.inpatientServices.averageLengthOfStay}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.inpatientServices.bedOccupancyRate">Bed Occupancy Rate</label>
                <input
                  type="number"
                  id="healthData.inpatientServices.bedOccupancyRate"
                  name="healthData.inpatientServices.bedOccupancyRate"
                  value={formData.healthData.inpatientServices.bedOccupancyRate}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.inpatientServices.totalDeaths">Total Deaths</label>
                <input
                  type="number"
                  id="healthData.inpatientServices.totalDeaths"
                  name="healthData.inpatientServices.totalDeaths"
                  value={formData.healthData.inpatientServices.totalDeaths}
                  onChange={onChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Surgical Procedures</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="healthData.surgicalProcedures.majorSurgeries">Major Surgeries</label>
                <input
                  type="number"
                  id="healthData.surgicalProcedures.majorSurgeries"
                  name="healthData.surgicalProcedures.majorSurgeries"
                  value={formData.healthData.surgicalProcedures.majorSurgeries}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.surgicalProcedures.minorSurgeries">Minor Surgeries</label>
                <input
                  type="number"
                  id="healthData.surgicalProcedures.minorSurgeries"
                  name="healthData.surgicalProcedures.minorSurgeries"
                  value={formData.healthData.surgicalProcedures.minorSurgeries}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.surgicalProcedures.emergencySurgeries">Emergency Surgeries</label>
                <input
                  type="number"
                  id="healthData.surgicalProcedures.emergencySurgeries"
                  name="healthData.surgicalProcedures.emergencySurgeries"
                  value={formData.healthData.surgicalProcedures.emergencySurgeries}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.surgicalProcedures.electiveSurgeries">Elective Surgeries</label>
                <input
                  type="number"
                  id="healthData.surgicalProcedures.electiveSurgeries"
                  name="healthData.surgicalProcedures.electiveSurgeries"
                  value={formData.healthData.surgicalProcedures.electiveSurgeries}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.surgicalProcedures.surgicalComplications">Surgical Complications</label>
                <input
                  type="number"
                  id="healthData.surgicalProcedures.surgicalComplications"
                  name="healthData.surgicalProcedures.surgicalComplications"
                  value={formData.healthData.surgicalProcedures.surgicalComplications}
                  onChange={onChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Family Planning</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="healthData.familyPlanning.condomsDistributed">Condoms Distributed</label>
                <input
                  type="number"
                  id="healthData.familyPlanning.condomsDistributed"
                  name="healthData.familyPlanning.condomsDistributed"
                  value={formData.healthData.familyPlanning.condomsDistributed}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.familyPlanning.oralPillsCycles">Oral Pills Cycles</label>
                <input
                  type="number"
                  id="healthData.familyPlanning.oralPillsCycles"
                  name="healthData.familyPlanning.oralPillsCycles"
                  value={formData.healthData.familyPlanning.oralPillsCycles}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.familyPlanning.iudInsertions">IUD Insertions</label>
                <input
                  type="number"
                  id="healthData.familyPlanning.iudInsertions"
                  name="healthData.familyPlanning.iudInsertions"
                  value={formData.healthData.familyPlanning.iudInsertions}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.familyPlanning.sterilizationProcedures">Sterilization Procedures</label>
                <input
                  type="number"
                  id="healthData.familyPlanning.sterilizationProcedures"
                  name="healthData.familyPlanning.sterilizationProcedures"
                  value={formData.healthData.familyPlanning.sterilizationProcedures}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.familyPlanning.injectableContraceptives">Injectable Contraceptives</label>
                <input
                  type="number"
                  id="healthData.familyPlanning.injectableContraceptives"
                  name="healthData.familyPlanning.injectableContraceptives"
                  value={formData.healthData.familyPlanning.injectableContraceptives}
                  onChange={onChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Laboratory Services</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="healthData.laboratoryServices.totalLabTests">Total Lab Tests</label>
                <input
                  type="number"
                  id="healthData.laboratoryServices.totalLabTests"
                  name="healthData.laboratoryServices.totalLabTests"
                  value={formData.healthData.laboratoryServices.totalLabTests}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.laboratoryServices.bloodTestsPerformed">Blood Tests Performed</label>
                <input
                  type="number"
                  id="healthData.laboratoryServices.bloodTestsPerformed"
                  name="healthData.laboratoryServices.bloodTestsPerformed"
                  value={formData.healthData.laboratoryServices.bloodTestsPerformed}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.laboratoryServices.urineTestsPerformed">Urine Tests Performed</label>
                <input
                  type="number"
                  id="healthData.laboratoryServices.urineTestsPerformed"
                  name="healthData.laboratoryServices.urineTestsPerformed"
                  value={formData.healthData.laboratoryServices.urineTestsPerformed}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.laboratoryServices.pathologyTests">Pathology Tests</label>
                <input
                  type="number"
                  id="healthData.laboratoryServices.pathologyTests"
                  name="healthData.laboratoryServices.pathologyTests"
                  value={formData.healthData.laboratoryServices.pathologyTests}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.laboratoryServices.radiologyTests">Radiology Tests</label>
                <input
                  type="number"
                  id="healthData.laboratoryServices.radiologyTests"
                  name="healthData.laboratoryServices.radiologyTests"
                  value={formData.healthData.laboratoryServices.radiologyTests}
                  onChange={onChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Resources</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="healthData.resources.doctorsAvailable">Doctors Available</label>
                <input
                  type="number"
                  id="healthData.resources.doctorsAvailable"
                  name="healthData.resources.doctorsAvailable"
                  value={formData.healthData.resources.doctorsAvailable}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.resources.nursesAvailable">Nurses Available</label>
                <input
                  type="number"
                  id="healthData.resources.nursesAvailable"
                  name="healthData.resources.nursesAvailable"
                  value={formData.healthData.resources.nursesAvailable}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.resources.paramedicStaff">Paramedic Staff</label>
                <input
                  type="number"
                  id="healthData.resources.paramedicStaff"
                  name="healthData.resources.paramedicStaff"
                  value={formData.healthData.resources.paramedicStaff}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.resources.totalBeds">Total Beds</label>
                <input
                  type="number"
                  id="healthData.resources.totalBeds"
                  name="healthData.resources.totalBeds"
                  value={formData.healthData.resources.totalBeds}
                  onChange={onChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="healthData.resources.operationalBeds">Operational Beds</label>
                <input
                  type="number"
                  id="healthData.resources.operationalBeds"
                  name="healthData.resources.operationalBeds"
                  value={formData.healthData.resources.operationalBeds}
                  onChange={onChange}
                  min="0"
                />
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="form-section">
        <h3>Additional Notes</h3>
        <div className="form-row">
          <div className="form-group" style={{ width: '100%' }}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={onChange}
              rows="3"
              style={{ width: '100%' }}
            ></textarea>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : report ? 'Update Report' : 'Create Report'}
        </button>
      </div>
    </form>
  );
}

export default HealthDataForm; 