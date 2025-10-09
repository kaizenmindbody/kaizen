import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import specialtiesReducer from './slices/specialtiesSlice';
import degreesReducer from './slices/degreesSlice';
import clinicsReducer from './slices/clinicsSlice';
import faqsReducer from './slices/faqsSlice';
import blogsReducer from './slices/blogsSlice';
import eventsReducer from './slices/eventsSlice';
import servicesReducer from './slices/servicesSlice';
import practitionerTypesReducer from './slices/practitionerTypesSlice';
import servicePricingReducer from './slices/servicePricingSlice';
import mediaReducer from './slices/mediaSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    specialties: specialtiesReducer,
    degrees: degreesReducer,
    clinics: clinicsReducer,
    faqs: faqsReducer,
    blogs: blogsReducer,
    events: eventsReducer,
    services: servicesReducer,
    practitionerTypes: practitionerTypesReducer,
    servicePricing: servicePricingReducer,
    media: mediaReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;