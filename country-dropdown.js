// Country data - all countries with DTV eligibility flag
const DTV_ELIGIBLE_COUNTRIES = [
    // Europe & UK
    'Andorra', 'Austria', 'Belgium', 'Croatia', 'Czech Republic', 'Denmark', 
    'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands', 
    'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Slovakia', 
    'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom',
    // Americas
    'United States', 'Canada', 'Brazil', 'Argentina', 'Chile', 'Colombia', 
    'Cuba', 'Dominican Republic', 'Ecuador', 'Guatemala', 'Jamaica', 'Mexico', 
    'Panama', 'Peru', 'Uruguay',
    // Asia & Oceania
    'Japan', 'South Korea', 'China', 'India', 'Indonesia', 'Malaysia', 
    'Singapore', 'Vietnam', 'Hong Kong', 'Macau', 'Philippines', 'Australia', 
    'New Zealand',
    // Middle East & GCC
    'Bahrain', 'United Arab Emirates', 'Oman', 'Saudi Arabia', 'Turkey', 'Israel',
    // Africa
    'South Africa', 'Mauritius', 'Morocco'
];

// All countries (DTV eligible + others)
const ALL_COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 
    'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 
    'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 
    'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 
    'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 
    'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 
    'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 
    'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 
    'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 
    'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 
    'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 
    'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 
    'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 
    'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 
    'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 
    'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 
    'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 
    'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 
    'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 
    'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 
    'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 
    'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 
    'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 
    'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 
    'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 
    'Yemen', 'Zambia', 'Zimbabwe'
].sort();

// Initialize country dropdown
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('country-search');
    const dropdown = document.getElementById('country-dropdown');
    const selectedInput = document.getElementById('selected-country');
    const selectedDisplay = document.getElementById('selected-country-display');
    const continueBtn = document.getElementById('country-continue');
    
    // Populate dropdown
    function populateDropdown(filter = '') {
        dropdown.innerHTML = '';
        
        const filtered = ALL_COUNTRIES.filter(country => 
            country.toLowerCase().includes(filter.toLowerCase())
        );
        
        filtered.forEach(country => {
            const isEligible = DTV_ELIGIBLE_COUNTRIES.includes(country);
            const option = document.createElement('div');
            option.className = `country-option ${isEligible ? 'dtv-eligible' : 'not-eligible'}`;
            option.textContent = country;
            option.dataset.value = country;
            option.dataset.eligible = isEligible;
            
            option.addEventListener('click', function() {
                selectCountry(country, isEligible);
            });
            
            dropdown.appendChild(option);
        });
        
        if (filtered.length > 0) {
            dropdown.classList.add('active');
        } else {
            dropdown.classList.remove('active');
        }
    }
    
    function selectCountry(country, isEligible) {
        selectedInput.value = country;
        selectedDisplay.innerHTML = `
            <strong>${country}</strong> <br>
            <span style="color: ${isEligible ? 'var(--green-dark)' : '#cc0000'}">
                ${isEligible ? '✓ DTV Eligible' : '✗ Not eligible for DTV'}
            </span>
        `;
        selectedDisplay.className = `selected-country-display active ${isEligible ? 'eligible' : 'not-eligible'}`;
        
        searchInput.value = country;
        dropdown.classList.remove('active');
        
        // Enable continue button
        continueBtn.disabled = false;
    }
    
    // Search input events
    searchInput.addEventListener('focus', () => populateDropdown());
    searchInput.addEventListener('input', (e) => populateDropdown(e.target.value));
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.country-search-container')) {
            dropdown.classList.remove('active');
        }
    });
});

// Submit country selection
function submitCountry() {
    const selectedCountry = document.getElementById('selected-country').value;
    const isEligible = DTV_ELIGIBLE_COUNTRIES.includes(selectedCountry);
    
    if (isEligible) {
        // Store answer and continue
        answers['1'] = selectedCountry;
        questionPath.push('1');
        
        // Hide current question
        document.querySelector('[data-question="1"]').classList.remove('active');
        
        // Show next question (passport)
        showQuestion('2');
    } else {
        // Hard stop
        showHardStop('ineligible-country');
    }
}
