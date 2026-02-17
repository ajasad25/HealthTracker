import React from 'react';
import { render, screen } from '@testing-library/react-native';
import MetricCard from '../components/MetricCard';

describe('MetricCard', () => {
  it('renders label, value, and unit correctly', () => {
    render(
      <MetricCard label="Heart Rate" value={72} unit="bpm" status="normal" />
    );
    expect(screen.getByText('Heart Rate')).toBeTruthy();
    expect(screen.getByText('72')).toBeTruthy();
    expect(screen.getByText('bpm')).toBeTruthy();
  });

  it('renders string values correctly', () => {
    render(
      <MetricCard label="Blood Pressure" value="120/80" unit="mmHg" status="normal" />
    );
    expect(screen.getByText('Blood Pressure')).toBeTruthy();
    expect(screen.getByText('120/80')).toBeTruthy();
    expect(screen.getByText('mmHg')).toBeTruthy();
  });

  it('renders with normal status styling', () => {
    const { getByText } = render(
      <MetricCard label="SpO2" value={98} unit="%" status="normal" />
    );
    const valueText = getByText('98');
    expect(valueText).toBeTruthy();
  });

  it('renders with warning status styling', () => {
    const { getByText } = render(
      <MetricCard label="Heart Rate" value={105} unit="bpm" status="warning" />
    );
    const valueText = getByText('105');
    expect(valueText).toBeTruthy();
  });

  it('renders with danger status styling', () => {
    const { getByText } = render(
      <MetricCard label="Temperature" value={40.2} unit="°C" status="danger" />
    );
    const valueText = getByText('40.2');
    expect(valueText).toBeTruthy();
  });
});
