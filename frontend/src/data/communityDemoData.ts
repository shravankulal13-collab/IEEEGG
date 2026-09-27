// ============================================================
// COMMUNITY DEMO DATA — FRONTEND ONLY
// Switch to real API: set COMMUNITY_DEMO_MODE = false in Community.tsx
// ============================================================

export interface DemoComment {
  id: string; author: string; avatar: string; text: string; timeAgo: string;
}
export interface DemoPost {
  id: string; title: string; location: string; description: string;
  category: string;
  status: 'Verified' | 'Ongoing' | 'Under Verification' | 'Information' | 'Resolved' | 'Critical';
  timeAgo: string; reporterName: string; reporterInitial: string;
  likes: number; commentCount: number; comments: DemoComment[];
  imageGradient: string; imageLabel: string;
  imageCount?: number; hasVideo?: boolean; videoDuration?: string;
  lat: number; lng: number; markerColor: string;
}

export const COMMUNITY_DEMO_POSTS: DemoPost[] = [
  {
    id:'demo-1', title:'Fallen Tree Blocking Road', location:'Kankanady Main Road, Mangaluru',
    description:'Large tree has fallen due to heavy rain, blocking half the road. Traffic is slow. Authorities have been notified.',
    category:'Infrastructure', status:'Verified', timeAgo:'2 hours ago',
    reporterName:'Rahul Shetty', reporterInitial:'R', likes:24, commentCount:6,
    comments:[
      {id:'c1',author:'Priya M.',avatar:'P',text:'BBMP notified, 2 hrs to clear.',timeAgo:'1h ago'},
      {id:'c2',author:'Anand K.',avatar:'A',text:'Avoid this route, big jam near junction.',timeAgo:'1h ago'},
      {id:'c3',author:'Suresh R.',avatar:'S',text:'Tree is huge. Take Kankanady bypass.',timeAgo:'45m ago'},
    ],
    imageGradient:'linear-gradient(135deg,#374151 0%,#1f2937 50%,#111827 100%)',
    imageLabel:'🌳', imageCount:3, lat:12.874, lng:74.858, markerColor:'#f97316',
  },
  {
    id:'demo-2', title:'Waterlogging near Junction', location:'Hampankatta, Mangaluru',
    description:'Heavy waterlogging after continuous rain. Vehicles are moving very slowly. Please avoid this route if possible.',
    category:'Natural Disaster', status:'Ongoing', timeAgo:'4 hours ago',
    reporterName:'Deepa Nair', reporterInitial:'D', likes:18, commentCount:4,
    comments:[
      {id:'c4',author:'Mohan P.',avatar:'M',text:'Water level is knee-deep near the signal.',timeAgo:'3h ago'},
      {id:'c5',author:'Kavitha S.',avatar:'K',text:'Drainage completely blocked. Municipality please fix!',timeAgo:'2h ago'},
    ],
    imageGradient:'linear-gradient(135deg,#1e3a5f 0%,#1e40af 50%,#1d4ed8 100%)',
    imageLabel:'🌊', hasVideo:true, videoDuration:'0:28', lat:12.868, lng:74.844, markerColor:'#3b82f6',
  },
  {
    id:'demo-3', title:'Road Accident', location:'Derebail, Mangaluru',
    description:'Two-wheeler accident reported near Derebail junction. Emergency services have been informed. Avoid the area.',
    category:'Accident', status:'Under Verification', timeAgo:'6 hours ago',
    reporterName:'Kiran Kumar', reporterInitial:'K', likes:32, commentCount:12,
    comments:[
      {id:'c6',author:'Vikram A.',avatar:'V',text:'Ambulance has arrived on scene.',timeAgo:'5h ago'},
      {id:'c7',author:'Reshma T.',avatar:'R',text:'Keep road clear for emergency vehicles.',timeAgo:'5h ago'},
    ],
    imageGradient:'linear-gradient(135deg,#450a0a 0%,#7f1d1d 50%,#991b1b 100%)',
    imageLabel:'🚗', lat:12.879, lng:74.867, markerColor:'#ef4444',
  },
  {
    id:'demo-4', title:'Streetlight Not Working', location:'Kadri Road, Mangaluru',
    description:'Multiple streetlights not working since last night. Area is dark and unsafe for pedestrians and two-wheelers.',
    category:'Infrastructure', status:'Information', timeAgo:'1 day ago',
    reporterName:'Anita Bhat', reporterInitial:'A', likes:8, commentCount:3,
    comments:[
      {id:'c9',author:'Ramesh D.',avatar:'R',text:'Complained to BESCOM helpline. Awaiting response.',timeAgo:'20h ago'},
    ],
    imageGradient:'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%)',
    imageLabel:'💡', lat:12.882, lng:74.849, markerColor:'#f59e0b',
  },
  {
    id:'demo-5', title:'Medical Emergency — Elderly Person', location:'Attavar, Mangaluru',
    description:'An elderly person collapsed near Attavar bus stop. Ambulance has been called. Bystanders providing first aid.',
    category:'Medical', status:'Critical', timeAgo:'30 minutes ago',
    reporterName:'Sneha Kamath', reporterInitial:'S', likes:45, commentCount:9,
    comments:[
      {id:'c10',author:'Dr. Prasad',avatar:'D',text:'Ambulance en-route from KMC. ETA 5 minutes.',timeAgo:'25m ago'},
      {id:'c11',author:'Leela V.',avatar:'L',text:'Keep area clear. Let medics work.',timeAgo:'20m ago'},
    ],
    imageGradient:'linear-gradient(135deg,#4c0519 0%,#881337 50%,#be123c 100%)',
    imageLabel:'🏥', lat:12.871, lng:74.852, markerColor:'#ef4444',
  },
  {
    id:'demo-6', title:'Fire at Commercial Building', location:'Lalbagh, Mangaluru',
    description:'Fire reported at a godown in Lalbagh area. Fire department alerted. Nearby buildings evacuated as precaution.',
    category:'Fire', status:'Ongoing', timeAgo:'1 hour ago',
    reporterName:'Suresh Hegde', reporterInitial:'S', likes:61, commentCount:17,
    comments:[
      {id:'c12',author:'Fire Dept.',avatar:'F',text:'2 fire tenders on scene. Fire being contained.',timeAgo:'45m ago'},
      {id:'c13',author:'Nandini P.',avatar:'N',text:'Residents of nearby building evacuated safely.',timeAgo:'30m ago'},
    ],
    imageGradient:'linear-gradient(135deg,#431407 0%,#c2410c 50%,#ea580c 100%)',
    imageLabel:'🔥', hasVideo:true, videoDuration:'0:15', lat:12.863, lng:74.841, markerColor:'#dc2626',
  },
  {
    id:'demo-7', title:'Suspicious Activity Reported', location:'Bejai, Mangaluru',
    description:'Suspicious group spotted near ATM at night. Police patrol requested. Locals advised to stay alert.',
    category:'Police', status:'Under Verification', timeAgo:'3 hours ago',
    reporterName:'Mohan Rai', reporterInitial:'M', likes:14, commentCount:5,
    comments:[
      {id:'c14',author:'Police PCR',avatar:'P',text:'Patrol vehicle dispatched to the area.',timeAgo:'2h ago'},
      {id:'c15',author:'Anil B.',avatar:'A',text:'All clear now, police have moved them on.',timeAgo:'1h ago'},
    ],
    imageGradient:'linear-gradient(135deg,#1e1b4b 0%,#3730a3 50%,#4338ca 100%)',
    imageLabel:'🚔', lat:12.861, lng:74.846, markerColor:'#6366f1',
  },
  {
    id:'demo-8', title:'Heavy Rain & Landslide Alert', location:'Kadaba–Mangaluru Highway',
    description:'IMD orange alert for coastal Karnataka. Possible landslide on Kadaba highway ghat section. Avoid night travel.',
    category:'Natural Disaster', status:'Verified', timeAgo:'5 hours ago',
    reporterName:'IMD Mangaluru', reporterInitial:'I', likes:88, commentCount:21,
    comments:[
      {id:'c16',author:'NDRF Team',avatar:'N',text:'Teams on standby. Small debris cleared at km 32.',timeAgo:'4h ago'},
      {id:'c17',author:'Geeta R.',avatar:'G',text:'Road is very slippery. Extreme caution.',timeAgo:'3h ago'},
    ],
    imageGradient:'linear-gradient(135deg,#0c1445 0%,#1e3a8a 50%,#1d4ed8 100%)',
    imageLabel:'🌧️', imageCount:2, lat:12.891, lng:74.835, markerColor:'#3b82f6',
  },
];

export const DEMO_TRENDING = [
  {rank:1,label:'Heavy Rain Alert',count:'12 reports',change:'+40%'},
  {rank:2,label:'Road Accidents',count:'8 reports',change:'+20%'},
  {rank:3,label:'Power Outage',count:'5 reports',change:'+15%'},
];

export const DEMO_MAP_MARKERS = COMMUNITY_DEMO_POSTS.map(p=>({
  id:p.id, lat:p.lat, lng:p.lng, color:p.markerColor, title:p.title,
  category:p.category, status:p.status,
}));