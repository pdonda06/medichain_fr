import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  useMediaQuery
} from '@mui/material';
import useResponsive from '../hooks/useResponsive';

/**
 * A responsive table component that adapts for mobile screens
 * On mobile devices, it transitions to a card-based layout for better readability
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions (each with id, label, format)
 * @param {Array} props.data - Array of data objects to display
 * @param {string} props.emptyMessage - Message to show when there's no data
 * @param {Object} props.sx - Additional styling
 * @param {string} props.idField - Field to use as the unique identifier (default: 'id')
 * @param {boolean} props.stickyHeader - Whether to use sticky headers
 * @returns {React.ReactElement}
 */
const ResponsiveTable = ({
  columns = [],
  data = [],
  emptyMessage = 'No data available',
  sx = {},
  idField = 'id',
  stickyHeader = false,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  
  if (!columns.length) {
    return null;
  }
  
  if (!data.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', ...sx }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }
  
  // Mobile card layout
  if (isMobile) {
    return (
      <Box sx={{ width: '100%', ...sx }}>
        {data.map((row, index) => (
          <Card 
            key={row[idField] || index} 
            sx={{ 
              mb: 2, 
              boxShadow: theme.shadows[1],
              '&:last-child': { mb: 0 }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {columns.map((column, colIndex) => {
                const value = row[column.id];
                const formattedValue = column.format && value !== null 
                  ? column.format(value, row) 
                  : value;
                
                return (
                  <Box key={column.id} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <Typography 
                      variant="caption" 
                      component="div"
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        mb: 0.5
                      }}
                    >
                      {column.label}
                    </Typography>
                    <Typography variant="body2">
                      {formattedValue !== undefined && formattedValue !== null
                        ? formattedValue
                        : '—'}
                    </Typography>
                    {colIndex < columns.length - 1 && (
                      <Divider sx={{ mt: 1.5 }} />
                    )}
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }
  
  // Regular table view for larger screens
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        width: '100%',
        overflowX: 'auto',
        ...sx 
      }}
    >
      <Table stickyHeader={stickyHeader} size="small" {...props}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell 
                key={column.id}
                align={column.align || 'left'}
                sx={{ 
                  fontWeight: 600,
                  whiteSpace: column.wrap ? 'normal' : 'nowrap',
                  backgroundColor: theme.palette.mode === 'light' 
                    ? theme.palette.grey[100] 
                    : theme.palette.grey[900],
                  ...column.sx
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={row[idField] || index}
              sx={{ 
                '&:nth-of-type(odd)': { 
                  bgcolor: theme.palette.mode === 'light' 
                    ? 'rgba(0, 0, 0, 0.02)' 
                    : 'rgba(255, 255, 255, 0.02)' 
                },
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { 
                  bgcolor: theme.palette.mode === 'light' 
                    ? 'rgba(0, 0, 0, 0.04)' 
                    : 'rgba(255, 255, 255, 0.04)'  
                }
              }}
            >
              {columns.map((column) => {
                const value = row[column.id];
                return (
                  <TableCell 
                    key={column.id} 
                    align={column.align || 'left'}
                    sx={{ 
                      whiteSpace: column.wrap ? 'normal' : 'nowrap',
                      ...column.cellSx
                    }}
                  >
                    {column.format && value !== null 
                      ? column.format(value, row) 
                      : (value !== undefined && value !== null ? value : '—')}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable; 