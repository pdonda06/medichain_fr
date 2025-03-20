import React, { useState, useRef } from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import { X } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';
import useKeyboardVisibility from '../hooks/useKeyboardVisibility';

/**
 * Enhanced form field component optimized for mobile use
 */
const MobileFormField = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  fullWidth = true,
  select = false,
  options = [],
  multiline = false,
  rows = 4,
  placeholder,
  disabled = false,
  InputProps,
  inputProps,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile, isTouch } = useResponsive();
  const { isKeyboardVisible, scrollToElement } = useKeyboardVisibility();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Form field size based on device
  const fieldSize = isMobile ? 'small' : 'medium';
  
  // Handle input focus
  const handleFocus = (e) => {
    setFocused(true);
    if (isMobile && isTouch) {
      setTimeout(() => {
        scrollToElement(inputRef.current);
      }, 300);
    }
    if (props.onFocus) props.onFocus(e);
  };
  
  // Handle input blur
  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) onBlur(e);
  };

  // Clear input value
  const handleClear = () => {
    onChange({ target: { name, value: '' } });
  };

  // Mobile-optimized styles
  const mobileStyles = isMobile ? {
    '& .MuiInputBase-root': {
      fontSize: '16px', // Prevents iOS zoom on focus
      padding: theme.spacing(1, 1.5),
    },
    '& .MuiInputLabel-root': {
      fontSize: '14px',
    },
    '& .MuiFormHelperText-root': {
      fontSize: '12px',
      marginTop: '2px',
    }
  } : {};

  // Determine whether to show clear button
  const showClear = isMobile && focused && value && !disabled && !select && type !== 'date';

  // Common input props
  const commonInputProps = {
    ...inputProps,
    'data-testid': `${name}-input`,
    autoComplete: type === 'password' ? 'new-password' : 'off',
  };

  // Determine input props with clear button
  const enhancedInputProps = {
    ...InputProps,
    ...(showClear && {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            edge="end"
            onClick={handleClear}
            aria-label="clear input"
            size="small"
          >
            <X size={16} />
          </IconButton>
        </InputAdornment>
      )
    })
  };

  // For select inputs
  if (select) {
    return (
      <FormControl 
        fullWidth={fullWidth} 
        error={!!error} 
        size={fieldSize}
        disabled={disabled}
        sx={{ 
          mb: isMobile ? 1.5 : 2,
          ...mobileStyles
        }}
      >
        <InputLabel id={`${name}-label`} required={required}>{label}</InputLabel>
        <Select
          labelId={`${name}-label`}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          label={label}
          inputRef={inputRef}
          {...props}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {(helperText || error) && (
          <FormHelperText>{error || helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // For text inputs and others
  return (
    <Box mb={isMobile ? 1.5 : 2}>
      <TextField
        type={type}
        id={name}
        name={name}
        label={label}
        value={value || ''}
        onChange={onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        error={!!error}
        helperText={error || helperText}
        required={required}
        fullWidth={fullWidth}
        multiline={multiline}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        size={fieldSize}
        variant="outlined"
        inputRef={inputRef}
        InputProps={enhancedInputProps}
        inputProps={commonInputProps}
        sx={{
          ...mobileStyles,
          ...props.sx
        }}
        {...props}
      />
    </Box>
  );
};

export default MobileFormField; 