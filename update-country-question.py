#!/usr/bin/env python3
"""
Update Question 1 to searchable country dropdown
"""

import re

with open('index.html', 'r') as f:
    content = f.read()

# New Question 1 - Country selector with search
new_question_1 = '''                <!-- Question 1: Country Citizenship -->
                <div class="quiz-question" data-question="1">
                    <h3>What country do you hold citizenship in?</h3>
                    <p>Select your country of citizenship from the dropdown below.</p>
                    
                    <div class="country-search-container">
                        <input type="text" 
                               id="country-search" 
                               class="country-search-input" 
                               placeholder="Search for your country..." 
                               autocomplete="off">
                        <div class="country-dropdown" id="country-dropdown"></div>
                    </div>
                    
                    <input type="hidden" id="selected-country" value="">
                    <div class="selected-country-display" id="selected-country-display"></div>
                    
                    <button class="btn btn-primary" id="country-continue" disabled onclick="submitCountry()">Continue</button>
                </div>'''

# Old Question 1 pattern
old_question_1_pattern = r'''                <!-- Question 1: Residence -->
                <div class="quiz-question" data-question="1">
                    <h3>Where are you currently resident\?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="uk-citizen">UK — I'm a British citizen</div>
                        <div class="quiz-option" data-value="uk-visa">UK — I'm here on a visa</div>
                        <div class="quiz-option" data-value="ireland">Ireland</div>
                        <div class="quiz-option" data-value="other">Other country</div>
                    </div>
                </div>'''

content = re.sub(old_question_1_pattern, new_question_1, content)

# Add country dropdown styles before </style>
country_styles = '''
        /* Country Dropdown Styles */
        .country-search-container {
            position: relative;
            max-width: 400px;
            margin: 1.5rem auto;
        }
        
        .country-search-input {
            width: 100%;
            padding: 1rem;
            font-size: 1rem;
            border: 2px solid var(--cream-dark);
            border-radius: 8px;
            background: var(--white);
            color: var(--charcoal);
            font-family: 'Inter', sans-serif;
        }
        
        .country-search-input:focus {
            outline: none;
            border-color: var(--gold-deep);
        }
        
        .country-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 300px;
            overflow-y: auto;
            background: var(--white);
            border: 2px solid var(--cream-dark);
            border-top: none;
            border-radius: 0 0 8px 8px;
            z-index: 1000;
            box-shadow: 0 10px 30px var(--shadow);
        }
        
        .country-dropdown.active {
            display: block;
        }
        
        .country-option {
            padding: 0.75rem 1rem;
            cursor: pointer;
            border-bottom: 1px solid var(--cream-dark);
            transition: background 0.2s;
            text-align: left;
        }
        
        .country-option:hover {
            background: var(--cream);
        }
        
        .country-option.dtv-eligible {
            border-left: 3px solid var(--green-soft);
        }
        
        .country-option.not-eligible {
            color: var(--charcoal-light);
        }
        
        .selected-country-display {
            margin: 1rem auto;
            padding: 1rem;
            background: var(--cream);
            border-radius: 8px;
            display: none;
            max-width: 400px;
        }
        
        .selected-country-display.active {
            display: block;
        }
        
        .selected-country-display.eligible {
            border-left: 4px solid var(--green-soft);
        }
        
        .selected-country-display.not-eligible {
            border-left: 4px solid #cc0000;
        }
'''

# Insert styles before the closing </style>
content = content.replace('</style>', country_styles + '</style>')

# Update the JavaScript - add country data and functions before the existing script
old_script_start = '<script>'

new_script_start = '''<script>
// DTV Eligible Countries List
const DTV_ELIGIBLE_COUNTRIES = [
    'Andorra', 'Argentina', 'Australia', 'Austria', 'Bahrain', 'Belgium', 
    'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Cuba', 
    'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador', 'Estonia', 
    'Finland', 'France', 'Germany', 'Greece', 'Guatemala', 'Hong Kong', 
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 
    'Jamaica', 'Japan', 'Latvia', 'Lithuania', 'Luxembourg', 'Macau', 
    'Malaysia', 'Mauritius', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 
    'Norway', 'Oman', 'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal', 
    'Romania', 'San Marino', 'Saudi Arabia', 'Singapore', 'Slovakia', 
    'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 
    'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States', 
    'Uruguay', 'Vietnam'
];

// All countries (DTV eligible + others for the dropdown)
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

// Country dropdown functions
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('country-search');
    const dropdown = document.getElementById('country-dropdown');
    const selectedInput = document.getElementById('selected-country');
    const selectedDisplay = document.getElementById('selected-country-display');
    const continueBtn = document.getElementById('country-continue');
    
    if (!searchInput) return;
    
    function populateDropdown(filter = '') {
        dropdown.innerHTML = '';
        
        const filtered = ALL_COUNTRIES.filter(country => 
            country.toLowerCase().includes(filter.toLowerCase())
        );
        
        filtered.forEach(country => {
            const isEligible = DTV_ELIGIBLE_COUNTRIES.includes(country);
            const option = document.createElement('div');
            option.className = `country-option ${isEligible ? 'dtv-eligible' : 'not-eligible'}`;
            option.textContent = country + (isEligible ? '' : ' (Not eligible)');
            option.dataset.value = country;
            option.dataset.eligible = isEligible;
            
            option.addEventListener('click', function() {
                selectedInput.value = country;
                selectedDisplay.innerHTML = `<strong>${country}</strong><br><span style="color: ${isEligible ? 'var(--green-dark)' : '#cc0000'}">${isEligible ? '✓ DTV Eligible' : '✗ Not eligible for DTV'}</span>`;
                selectedDisplay.className = `selected-country-display active ${isEligible ? 'eligible' : 'not-eligible'}`;
                searchInput.value = country;
                dropdown.classList.remove('active');
                continueBtn.disabled = false;
            });
            
            dropdown.appendChild(option);
        });
        
        if (filtered.length > 0) {
            dropdown.classList.add('active');
        } else {
            dropdown.classList.remove('active');
        }
    }
    
    searchInput.addEventListener('focus', () => populateDropdown());
    searchInput.addEventListener('input', (e) => populateDropdown(e.target.value));
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.country-search-container')) {
            dropdown.classList.remove('active');
        }
    });
});

function submitCountry() {
    const selectedCountry = document.getElementById('selected-country').value;
    const isEligible = DTV_ELIGIBLE_COUNTRIES.includes(selectedCountry);
    
    if (isEligible) {
        answers['1'] = selectedCountry;
        questionPath.push('1');
        document.querySelector('[data-question="1"]').classList.remove('active');
        showQuestion('2');
    } else {
        // Hard stop
        document.querySelector('.quiz-progress').style.display = 'none';
        document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
        const hardStop = document.getElementById('hard-stop-country');
        if (hardStop) hardStop.classList.add('show');
    }
}
'''

content = content.replace(old_script_start, new_script_start)

# Write updated file
with open('index.html', 'w') as f:
    f.write(content)

print("✅ Updated index.html with searchable country dropdown")
print("Changes:")
print("- Question 1 now asks for citizenship (not residence)")
print("- Searchable dropdown with all countries")
print("- DTV eligible countries marked with green indicator")
print("- Non-eligible countries show 'Not eligible' and hard stop")
