import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import healthDataService from '../services/healthDataService';

function ViewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await healthDataService.getHealthDataById(id);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch report');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'draft': return 'status-draft';
      case 'submitted': return 'status-submitted';
      case 'reviewed': return 'status-reviewed';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading report...</div>;
  }

  if (!report) {
    return <div className="error">Report not found</div>;
  }

  return (
    <div className="report-view">
      <div className="report-header">
        <h1>Health Data Report</h1>
        <div className="report-actions">
          <button className="btn" onClick={() => navigate('/view-reports')}>
            Back to Reports
          </button>
          {(report.status === 'draft' || ['super-admin', 'state-admin', 'district-admin'].includes(user.role)) && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/report/${id}/edit`)}
            >
              Edit Report
            </button>
          )}
        </div>
      </div>

      <div className="report-info">
        <div className="info-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Facility</label>
              <span>{report.facility?.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Department</label>
              <span>{report.department?.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Reporting Period</label>
              <span>{report.reportingPeriod?.year} - {report.reportingPeriod?.month}</span>
            </div>
            <div className="info-item">
              <label>Status</label>
              <span className={getStatusClass(report.status)}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>Submission Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Submitted By</label>
              <span>{report.submittedBy?.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Submission Date</label>
              <span>{formatDate(report.submittedAt)}</span>
            </div>
            {report.reviewedBy && (
              <div className="info-item">
                <label>Reviewed By</label>
                <span>{report.reviewedBy.name}</span>
              </div>
            )}
            {report.approvedBy && (
              <div className="info-item">
                <label>Approved By</label>
                <span>{report.approvedBy.name}</span>
              </div>
            )}
            {report.rejectedBy && (
              <div className="info-item">
                <label>Rejected By</label>
                <span>{report.rejectedBy.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="info-section">
          <h2>Health Data</h2>
          <div className="health-data-grid">
            {Object.entries(report.healthData).map(([category, data]) => (
              <div key={category} className="health-data-category">
                <h3>{category}</h3>
                <div className="data-grid">
                  {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="data-item">
                      <label>{key}</label>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {report.notes && (
          <div className="info-section">
            <h2>Notes</h2>
            <p>{report.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewReport; 