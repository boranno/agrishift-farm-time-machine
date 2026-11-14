export const HOME_TOOL_GROUPS = [
  {
    titleKey: 'home.directoryFarm',
    icon: 'MapPin',
    items: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: 'LayoutDashboard' },
      { to: '/farm-map', labelKey: 'nav.farmMap', icon: 'Map' },
      { to: '/weather-calendar', labelKey: 'nav.weatherCalendar', icon: 'CloudSun' },
      { to: '/soil-report', labelKey: 'nav.soilReport', icon: 'FileText' },
      { to: '/soil-history', labelKey: 'nav.soilHistory', icon: 'History' }
    ]
  },
  {
    titleKey: 'home.directoryPlanning',
    icon: 'Sprout',
    items: [
      { to: '/crop-suitability', labelKey: 'nav.cropSuitability', icon: 'Sprout' },
      { to: '/rotation-planner', labelKey: 'nav.rotationPlanner', icon: 'CalendarDays' },
      { to: '/what-if-simulator', labelKey: 'nav.whatIfSimulator', icon: 'SlidersHorizontal' },
      { to: '/scenario-comparison', labelKey: 'nav.scenarioComparison', icon: 'GitCompare' }
    ]
  },
  {
    titleKey: 'home.directoryMonitoring',
    icon: 'Activity',
    items: [
      { to: '/alerts', labelKey: 'nav.alerts', icon: 'Bell' },
      { to: '/salinity-prediction', labelKey: 'nav.salinityPrediction', icon: 'Gauge' },
      { to: '/data-sources', labelKey: 'nav.dataSources', icon: 'Satellite' }
    ]
  },
  {
    titleKey: 'home.directoryResearch',
    icon: 'FlaskConical',
    items: [
      { to: '/ml-suitability', labelKey: 'nav.mlSuitability', icon: 'Cpu' },
      { to: '/intelligent-rotation', labelKey: 'nav.intelligentRotation', icon: 'Workflow' },
      { to: '/model-evaluation', labelKey: 'nav.modelEvaluation', icon: 'ShieldCheck' }
    ]
  }
];
