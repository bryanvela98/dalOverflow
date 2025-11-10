// import React from "react";
// import { Routes as RouterRoutes, Route } from "react-router-dom";
// import LandingPage from "../pages/LandingPage";
// import CreateQuestion from "../components/Question/CreateQuestion";
// import Tags from "../components/Tags/Tags";
// import LoginRegistration from "../pages/LoginRegistration";
// // import QuestionPage from "../components/Question/QuestionPage";
// import ProtectedRoute from "./ProtectedRoute";
// import ArticlesPage from "../components/Article/ArticlesPage";
// import TagDetail from "../pages/TagDetail";
// import UserProfile from "../pages/UserProfile";
// import BasicQuestionDetail from "../components/Question/BasicQuestionDetail"; // Add this import

// const Routes = () => {
//   return (
//     <RouterRoutes>
//       {/* Landing Page with nested routes */}
//       <Route path="/" element={<LandingPage />}>
//         <Route index element={<QuestionPage />} />
//         {/* <Route path="questions/:id" element={<BasicQuestionDetail />} /> */}
//         <Route path="articles" element={<ArticlesPage />} />
//         <Route path="tags" element={<Tags />} />
//         <Route path="tags/:tagName" element={<TagDetail />} />
//         <Route path="users/:userId" element={<UserProfile />} />
//       </Route>

//       {/* Auth Routes */}
//       <Route path="/login" element={<LoginRegistration />} />

//       {/* Protected Routes */}
//       <Route element={<ProtectedRoute />}>
//         <Route path="/create-question" element={<CreateQuestion />} />
//         <Route
//           path="/notifications"
//           element={
//             <div style={{ padding: "2rem", textAlign: "center" }}>
//               <h1>All Notifications</h1>
//               <p>Notifications page coming soon...</p>
//             </div>
//           }
//         />
//       </Route>
//     </RouterRoutes>
//   );
// };

// export default Routes;
