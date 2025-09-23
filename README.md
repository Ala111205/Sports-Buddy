# Sports-Buddy
    Sports Buddy is a full-stack web application built with React.js (frontend), Express.js (backend), MongoDB Atlas (database), and Firebase Authentication. It enables users to explore sports events, see where and when they are happening, and view event availability (open or closed) directly from the sports page. Logged-in admins can create, update, and delete events through a secure form, while regular users can only view events. A built-in React-Map integration allows admins to pinpoint event locations on a map with a searchable interface. The entire system is designed for smooth user experience and easy event management.

✨ **Key Features**

  ->Event Management

    .Admins can create, update, and delete sports events using a protected form.
  
    .Each event includes details like title, sport name, location, city, area, rules, players, and description.
  
  ->Event Availability
  
    .Sports page shows whether events are open or closed at a glance.
  
    .Clicking an availability card displays detailed information about that particular event.
  
  ->Map Integration
  
    .Interactive React-Map with a search bar helps admins quickly pinpoint event locations.
  
    .Pointer is fixed during updates for accurate event placement.
  
  ->Authentication
  
    .Firebase Authentication (Email/Password) secures all admin-only features.
  
    .Only logged-in admins can create, edit, or delete events.
  
  ->Technology Stack
  
    .Frontend: React.js, React Router, Context API, Axios.
  
    .Backend: Express.js with Node.js, MongoDB Atlas, Mongoose.
  
    .Authentication: Firebase Auth for secure login and admin verification.
  
  ->User Experience
  
    .Responsive and intuitive UI built with React.
      
    .Clean navigation bar with links to sports, events, and admin options.
      
    .Easily searchable and filterable events via the React Map.
  
    .Frontend Link: https://sports-buddy-psi.vercel.app/
