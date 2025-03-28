import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import HealthDataForm from '../components/HealthDataForm';

function EditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchReport();
  }, [id]);
  
  const fetchReport = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(`/api/health-data/${id}`, config);
      setReport(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to fetch report. You may not have permission to view this report.');
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuccess = () => {
    toast.success('Report updated successfully');
    navigate('/view-reports');
  };
  
  return (
    <div className="dashboard-container">
      <h1>Edit Health Report</h1>
      
      {loading ? (
        <div className="loading">Loading report...</div>
      ) : error ? (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => navigate('/view-reports')} className="btn">
            Back to Reports
          </button>
        </div>
      ) : !report ? (
        <div className="alert alert-error">
          <p>Report not found</p>
          <button onClick={() => navigate('/view-reports')} className="btn">
            Back to Reports
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="report-meta">
            <div className="meta-item">
              <strong>Report ID:</strong> {report._id}
            </div>
            <div className="meta-item">
              <strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}
            </div>
            {report.updatedAt && (
              <div className="meta-item">
                <strong>Last Updated:</strong> {new Date(report.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
          
          <HealthDataForm report={report} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
}

export default EditReport; 