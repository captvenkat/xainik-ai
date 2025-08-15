# 🔧 Google Places API Setup

## 📋 Required Environment Variable

To enable location autocomplete functionality, you need to add the Google Places API key to your environment variables.

### **1. Get Google Places API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### **2. Add to Environment Variables:**

Add this line to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### **3. API Key Restrictions (Recommended):**

For security, restrict your API key:

1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers (websites)"
4. Add your domain: `https://your-domain.com/*`
5. Under "API restrictions", select "Restrict key"
6. Select "Places API" from the list

**Note:** The API is configured to prioritize Indian cities with `components=country:in` parameter.

### **4. Features Enabled:**

With the API key configured, the location autocomplete will:

- ✅ Show multiple location suggestions (up to 5)
- ✅ Display only city names (e.g., "New York, NY")
- ✅ Provide real-time search as you type
- ✅ Work in both profile editing and pitch creation

### **5. Fallback Behavior:**

If no API key is provided, the component will show basic Indian city suggestions:
- Mumbai, Maharashtra
- Delhi, Delhi
- Bangalore, Karnataka
- Hyderabad, Telangana
- Chennai, Tamil Nadu
- Kolkata, West Bengal
- Pune, Maharashtra
- Ahmedabad, Gujarat

### **6. Usage:**

The LocationAutocomplete component is now used in:
- **VeteranProfileTab**: For editing profile location
- **Pitch Creation**: For setting pitch location (auto-populated from profile)

### **7. Cost:**

Google Places API has a free tier:
- $200 credit per month
- Approximately 28,500 requests per month
- Additional requests cost $0.017 per 1,000 requests

**Note:** The API is only called when users type in the location field, so usage should be minimal.
