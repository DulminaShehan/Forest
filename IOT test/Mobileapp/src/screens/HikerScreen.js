import React from 'react';
import DashboardScreen from './DashboardScreen';

export default function HikerScreen(props) {
  return <DashboardScreen {...props} route={{ params: { role: 'HIKER' } }} />;
}
