import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import specialtiesReducer from './slices/specialtiesSlice';
import degreesReducer from './slices/degreesSlice';
import clinicsReducer from './slices/clinicsSlice';
import faqsReducer from './slices/faqsSlice';
import blogsReducer from './slices/blogsSlice';
import eventsReducer from './slices/eventsSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    specialties: specialtiesReducer,
    degrees: degreesReducer,
    clinics: clinicsReducer,
    faqs: faqsReducer,
    blogs: blogsReducer,
    events: eventsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;