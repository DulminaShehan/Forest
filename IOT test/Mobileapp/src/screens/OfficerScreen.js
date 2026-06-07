import React from 'react';
import DashboardScreen from './DashboardScreen';

export default function OfficerScreen(props) {
  return <DashboardScreen {...props} route={{ params: { role: 'OFFICER' } }} />;
}
