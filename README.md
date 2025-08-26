# House Construction Cost Manager

A comprehensive web application for tracking and managing house construction expenses with full CRUD functionality.

## Features

### Complete Cost Management
- **View All Entries**: Unified table showing all 190 construction entries from ground floor, first floor, and second floor
- **Add New Entries**: Easy form to add new construction costs with date, category, amount, and notes
- **Edit Entries**: Click edit button on any entry to modify all fields inline
- **Delete Entries**: Remove entries with confirmation dialog

### Data Organization
- **Sortable Table**: Click any column header to sort by date, category, amount, or notes
- **Search & Filter**: Search across all fields or filter by specific categories
- **Pagination**: Organized display with 20 entries per page for better performance
- **Real-time Updates**: All totals and analytics update immediately when data changes

### Analytics & Insights
- **Category Breakdown**: See spending by category with amounts and percentages
- **Total Project Cost**: Live calculation showing ₹28,53,689 total spent
- **Entry Statistics**: Track total number of entries and date range
- **Visual Charts**: Category spending visualization

### Technical Features
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Indian Rupee Formatting**: Proper ₹ symbol and comma formatting
- **Date Handling**: DD/MM/YYYY format with date picker
- **Data Validation**: Input validation and error handling
- **Modern UI**: Clean, professional interface with smooth animations

## Data Structure

The application combines all construction data into a single "House" category, standardizing duplicate categories:
- **Labour**: All labor-related expenses
- **Steel**: All steel purchases 
- **Cement**: All cement purchases
- **Bricks**: All brick purchases
- **Sand**: M-sand and P-sand combined
- **Electrical**: All electrical work and materials
- **Plumbing**: All plumbing work and materials
- **Doors and Windows**: All door, window, and vascal work
- And 13 other categories...

## Quick Start

1. **Upload to GitHub**: Create a new repository and upload these files:
   - `index.html` (main page)
   - `style.css` (styling)
   - `app.js` (JavaScript functionality)

2. **Enable GitHub Pages**: 
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch" 
   - Choose "main" branch and "/ (root)" folder
   - Save

3. **Access Your Site**: GitHub will provide a URL like:
   `https://yourusername.github.io/repository-name`

## Usage

### Adding New Entries
1. Click "Add Entry" tab
2. Select date (defaults to today)
3. Choose category from dropdown or select "Other" for custom
4. Enter amount in rupees
5. Add notes (optional)
6. Click "Add Entry"

### Editing Entries
1. Find the entry in "All Entries" table
2. Click the edit button (pencil icon)
3. Modify any field inline
4. Click save (checkmark) or cancel (X)
5. Changes update immediately

### Deleting Entries
1. Click the delete button (trash icon) on any entry
2. Confirm deletion in the dialog
3. Entry is removed and totals updated

### Analytics
1. Click "Analytics" tab
2. View spending breakdown by category
3. See visual representation of costs
4. Filter by specific categories

## Data Notes

- **Total Entries**: 190 construction entries
- **Date Range**: March 12, 2025 to August 25, 2025  
- **Total Cost**: ₹28,53,689
- **Top Categories**: Mestri (29.6%), Steel (21.8%), Cement (11.4%)
- **Original Floors**: Data combined from Ground, First, and Second floors

## Browser Compatibility

Works in all modern browsers:
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## License

Free to use and modify for personal and commercial projects.