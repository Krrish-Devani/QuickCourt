import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

export const useVenueStore = create((set, get) => ({
    venues: [],
    currentVenue: null,
    isLoading: false,
    isCreating: false,
    isSearching: false,
    currentPage: 1,
    totalPages: 1,
    searchQuery: '',
    selectedSport: '',
    filters: {
        priceRange: { min: '', max: '' },
        location: '',
        amenities: []
    },

    // Get all venues with filters
    getVenues: async (page = 1, sport = '', search = '', filters = {}) => {
        set({ isLoading: true });
        try {
            const params = new URLSearchParams();
            if (page) params.append('page', page);
            if (sport) params.append('sport', sport);
            if (search) params.append('search', search);
            if (filters.priceMin) params.append('priceMin', filters.priceMin);
            if (filters.priceMax) params.append('priceMax', filters.priceMax);
            if (filters.location) params.append('location', filters.location);
            if (filters.amenities && filters.amenities.length > 0) {
                filters.amenities.forEach(amenity => params.append('amenities', amenity));
            }
            params.append('limit', '8'); // 8 venues per page

            const res = await axiosInstance.get(`/venues?${params}`);
            set({ 
                venues: res.data.venues,
                currentPage: res.data.currentPage,
                totalPages: res.data.totalPages,
                searchQuery: search,
                selectedSport: sport
            });
        } catch (error) {
            console.log('Error fetching venues:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch venues');
        } finally {
            set({ isLoading: false });
        }
    },

    // Search venues with debouncing support
    searchVenues: async (search = '', filters = {}) => {
        set({ isSearching: true });
        try {
            const { selectedSport } = get();
            const params = new URLSearchParams();
            params.append('page', '1');
            if (selectedSport) params.append('sport', selectedSport);
            if (search) params.append('search', search);
            if (filters.priceMin) params.append('priceMin', filters.priceMin);
            if (filters.priceMax) params.append('priceMax', filters.priceMax);
            if (filters.location) params.append('location', filters.location);
            if (filters.amenities && filters.amenities.length > 0) {
                filters.amenities.forEach(amenity => params.append('amenities', amenity));
            }
            params.append('limit', '8');

            const res = await axiosInstance.get(`/venues?${params}`);
            set({ 
                venues: res.data.venues,
                currentPage: res.data.currentPage,
                totalPages: res.data.totalPages,
                searchQuery: search
            });
        } catch (error) {
            console.log('Error searching venues:', error);
            toast.error(error.response?.data?.message || 'Failed to search venues');
        } finally {
            set({ isSearching: false });
        }
    },

    // Get venue by ID
    getVenueById: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/venues/${id}`);
            set({ currentVenue: res.data });
            return res.data;
        } catch (error) {
            console.log('Error fetching venue:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch venue');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Create new venue
    createVenue: async (venueData) => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.post('/venues', venueData);
            const { venues } = get();
            set({ venues: [res.data, ...venues] });
            toast.success('Venue created successfully!');
            return res.data;
        } catch (error) {
            console.log('Error creating venue:', error);
            toast.error(error.response?.data?.message || 'Failed to create venue');
            throw error;
        } finally {
            set({ isCreating: false });
        }
    },

    // Update venue
    updateVenue: async (id, venueData) => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.put(`/venues/${id}`, venueData);
            const { venues } = get();
            const updatedVenues = venues.map(venue => 
                venue._id === id ? res.data : venue
            );
            set({ venues: updatedVenues });
            toast.success('Venue updated successfully!');
            return res.data;
        } catch (error) {
            console.log('Error updating venue:', error);
            toast.error(error.response?.data?.message || 'Failed to update venue');
            throw error;
        } finally {
            set({ isCreating: false });
        }
    },

    // Set filters
    setFilters: (sport = '', search = '', filters = {}) => {
        set({ 
            selectedSport: sport, 
            searchQuery: search,
            filters: { ...get().filters, ...filters }
        });
        get().getVenues(1, sport, search, { ...get().filters, ...filters });
    },

    // Update only filters without changing sport/search
    updateFilters: (newFilters) => {
        const { selectedSport, searchQuery } = get();
        const updatedFilters = { ...get().filters, ...newFilters };
        set({ filters: updatedFilters });
        get().getVenues(1, selectedSport, searchQuery, updatedFilters);
    },

    // Clear all filters
    clearFilters: () => {
        set({ 
            filters: {
                priceRange: { min: '', max: '' },
                location: '',
                amenities: []
            }
        });
        const { selectedSport, searchQuery } = get();
        get().getVenues(1, selectedSport, searchQuery, {});
    },

    // Clear current venue
    clearCurrentVenue: () => set({ currentVenue: null }),

    // Reset store
    reset: () => set({
        venues: [],
        currentVenue: null,
        isLoading: false,
        isCreating: false,
        isSearching: false,
        currentPage: 1,
        totalPages: 1,
        searchQuery: '',
        selectedSport: '',
        filters: {
            priceRange: { min: '', max: '' },
            location: '',
            amenities: []
        }
    })
}));
