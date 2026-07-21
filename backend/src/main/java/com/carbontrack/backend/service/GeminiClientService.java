package com.carbontrack.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.carbontrack.backend.entity.ActivityLog;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiClientService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiClientService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String generateRecommendation(String prompt) {
        return generateRecommendation(prompt, prompt, null, null, null, 0.0, null);
    }

    public String generateRecommendation(String prompt, String userMessage, String username, String email, Double totalEmissions, List<ActivityLog> logs) {
        return generateRecommendation(prompt, userMessage, username, email, totalEmissions, 0.0, logs);
    }

    public String generateRecommendation(String prompt, String userMessage, String username, String email, Double totalEmissions, Double todayEmissions, List<ActivityLog> logs) {
        if (geminiApiKey == null || geminiApiKey.contains("your_api_key_here")) {
            return getPersonalizedFallback(userMessage, username, email, totalEmissions, todayEmissions, logs);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String url = geminiApiUrl + "?key=" + geminiApiKey;
            String responseStr = restTemplate.postForObject(url, request, String.class);

            JsonNode root = objectMapper.readTree(responseStr);
            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Gemini API failed (Quota/Network). Falling back to personalized dictionary...");
            return getPersonalizedFallback(userMessage, username, email, totalEmissions, todayEmissions, logs);
        }
    }

    private String getPersonalizedFallback(String userMessage, String username, String email, Double totalEmissions, Double todayEmissions, List<ActivityLog> logs) {
        if (userMessage == null) {
            return getFallbackRecommendation("");
        }

        String query = userMessage.toLowerCase();

        // 1. Today's emissions
        if (query.contains("today") || query.contains("today's") || query.contains("emissions today") || query.contains("today emissions")) {
            double todayVal = todayEmissions != null ? todayEmissions : 0.0;
            java.time.LocalDate todayDate = java.time.LocalDate.now();
            if (todayVal == 0.0) {
                return String.format("Hello %s! You haven't logged any carbon emissions today (%s). If you traveled, used energy, or ate meals today, be sure to log them on your Dashboard!",
                    username != null ? username : "there", todayDate.toString());
            } else {
                return String.format("Hello %s! Your total carbon footprint for today (%s) is **%.2f kg CO2e** across your logged activities today.",
                    username != null ? username : "there", todayDate.toString(), todayVal);
            }
        }

        // 1. Who am I
        if (query.contains("who am i") || query.contains("my name") || query.contains("my username") || query.contains("my email") || query.contains("who is logged")) {
            if (username != null) {
                return "Hello! You are logged in as **" + username + "** (Email: " + (email != null ? email : "Not set") + "). I'm CarbonBot, and I'm ready to help you manage your carbon tracker!";
            }
        }

        // 2. Last activity / Last logged
        if (query.contains("last activity") || query.contains("last logged") || query.contains("last log") || query.contains("latest activity")) {
            if (logs == null || logs.isEmpty()) {
                return "It looks like you haven't logged any activities yet. Try adding some activities (like transport, food, or energy usage) on the Dashboard to get started!";
            }
            ActivityLog lastLog = logs.get(0);
            String category = lastLog.getCategory();
            String type = lastLog.getActivityType();
            Double emissions = lastLog.getCalculatedEmissions();
            Double amount = lastLog.getAmount();
            String unit = lastLog.getUnit();

            String impact = (emissions > 10.0)
                ? "This is considered high impact. You can reduce this by carpooling, switching to public transit, or choosing plant-based alternatives."
                : "This is relatively low impact. Great job keeping your emissions low!";

            return String.format("Your last logged activity was on **%s** under **%s** category:\n"
                + "- **Type**: %s\n"
                + "- **Quantity**: %.2f %s\n"
                + "- **Emissions**: %.2f kg CO2e\n\n"
                + "%s",
                lastLog.getLogDate() != null ? lastLog.getLogDate().toString() : "N/A",
                category != null ? category : "N/A",
                type != null ? type : "N/A",
                amount != null ? amount : 0.0,
                unit != null ? unit : "",
                emissions != null ? emissions : 0.0,
                impact);
        }

        // 3. Lifetime / total emissions
        if (query.contains("total carbon") || query.contains("total footprint") || query.contains("lifetime carbon") || query.contains("total emissions") || query.contains("how much carbon did i produce") || query.contains("how much carbon have i")) {
            double footprint = totalEmissions != null ? totalEmissions : 0.0;
            return String.format("Hello %s! Your total lifetime carbon footprint is **%.2f kg CO2e** across all logged activities. Let's aim to bring this down by setting green goals!",
                username != null ? username : "there", footprint);
        }

        // 4. Recent activities list
        if (query.contains("recent activities") || query.contains("recent logs") || query.contains("my history") || query.contains("show my logs")) {
            if (logs == null || logs.isEmpty()) {
                return "You have no logged activities in your history yet.";
            }
            StringBuilder sb = new StringBuilder("Here are your recent logged activities:\n\n");
            int limit = Math.min(3, logs.size());
            for (int i = 0; i < limit; i++) {
                ActivityLog log = logs.get(i);
                sb.append(String.format("- **%s**: %s (%.2f kg CO2e)\n",
                    log.getLogDate() != null ? log.getLogDate().toString() : "Date N/A",
                    log.getActivityType() != null ? log.getActivityType() : "Unknown",
                    log.getCalculatedEmissions() != null ? log.getCalculatedEmissions() : 0.0));
            }
            return sb.toString();
        }

        // Fallback to keyword-based tips
        return getFallbackRecommendation(userMessage);
    }

    private String getFallbackRecommendation(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        
        // Transport Tips
        if (lowerPrompt.contains("car_petrol") || lowerPrompt.contains("car_diesel")) {
            return "Petrol and diesel car emissions contribute heavily to your footprint. Consider combining errands into a single trip, maintaining correct tire pressure to improve fuel efficiency by up to 3%, or carpooling with colleagues twice a week to cut transport emissions in half.";
        } else if (lowerPrompt.contains("car_electric")) {
            return "Electric vehicles are highly efficient, but their footprint depends on the grid source. Lower your impact further by charging during off-peak hours (usually overnight) or switching to a 100% renewable solar or wind energy provider.";
        } else if (lowerPrompt.contains("car_hybrid")) {
            return "Your hybrid vehicle is great for reducing emissions, but city stop-and-go driving still uses fuel. Try maximizing your EV-only mode for short trips under 5 km, and practice eco-driving techniques like gradual braking and smooth acceleration.";
        } else if (lowerPrompt.contains("motorcycle")) {
            return "Motorcycles emit less carbon than large SUVs, but solo commutes still add up. Try carpooling with others or switching to a train or subway commute on bad weather days to save fuel and reduce tailpipe emissions.";
        } else if (lowerPrompt.contains("bus")) {
            return "Taking the bus is an excellent green choice. To reduce your emissions to zero for short commutes, try walking or cycling for trips under 2 km, which also has great health and fitness benefits.";
        } else if (lowerPrompt.contains("train") || lowerPrompt.contains("subway") || lowerPrompt.contains("public_transit")) {
            return "Public transit is one of the most sustainable ways to travel. Optimize your footprint even further by combining multiple trips, walking for the final mile, or negotiating a remote-work day to avoid commuting entirely.";
        } else if (lowerPrompt.contains("flight_short") || lowerPrompt.contains("flight_long") || lowerPrompt.contains("flight")) {
            return "Air travel has an extremely high carbon intensity per kilometer. Consider replacing short-haul flights with video conferences or high-speed rail, and choose direct, economy-class flights for unavoidable long-distance travel.";
        } else if (lowerPrompt.contains("taxi")) {
            return "Riding in solo taxis has a high per-passenger emission rate. Consider using ridesharing options to share the vehicle, or take public subways and buses, which emit up to 80% less CO2 per kilometer.";
            
        // Electricity & Energy Tips
        } else if (lowerPrompt.contains("electricity_grid") || lowerPrompt.contains("grid")) {
            return "Grid electricity emissions are mainly driven by fossil fuel power plants. Cut your electricity footprint by switching all home lights to energy-efficient LEDs, unplugging idle appliances, and washing laundry in cold water (30°C) instead of hot.";
        } else if (lowerPrompt.contains("electricity_solar") || lowerPrompt.contains("electricity_wind") || lowerPrompt.contains("solar") || lowerPrompt.contains("wind")) {
            return "Using renewable solar or wind energy is a fantastic step toward net-zero. Maximize this setup by scheduling high-energy tasks—like running the washing machine, dishwasher, or charging devices—during peak sunny or windy hours.";
        } else if (lowerPrompt.contains("natural_gas") || lowerPrompt.contains("heating_oil") || lowerPrompt.contains("lpg")) {
            return "Home heating is one of the largest household emission sources. Seal window drafts with weather stripping, lower your thermostat by just 1-2°C (wear a cozy sweater instead), and service your heating system annually to maintain peak efficiency.";
        } else if (lowerPrompt.contains("coal") || lowerPrompt.contains("wood_burning")) {
            return "Coal and wood burning release significant CO2 and harmful indoor particulate matter. Consider planning a transition to clean, energy-efficient electric heat pumps, which provide both heating and cooling at a fraction of the carbon cost.";
            
        // Diet & Food Tips
        } else if (lowerPrompt.contains("beef")) {
            return "Beef has an exceptionally high carbon footprint due to land use and methane emissions. Try swapping beef for chicken, pork, or plant-based proteins like lentils, chickpeas, and beans to reduce your meal emissions by up to 80%.";
        } else if (lowerPrompt.contains("lamb")) {
            return "Lamb production is highly greenhouse gas-intensive. Replace lamb in your recipes with local fish, poultry, or high-protein plant alternatives to significantly lower your personal food carbon footprint.";
        } else if (lowerPrompt.contains("pork") || lowerPrompt.contains("chicken") || lowerPrompt.contains("poultry") || lowerPrompt.contains("meat")) {
            return "While white meats are lower emission than red meats, plant proteins are the most sustainable option. Try introducing a couple of meatless days (like Meatless Mondays) each week to explore delicious vegan or vegetarian recipes.";
        } else if (lowerPrompt.contains("dairy") || lowerPrompt.contains("eggs")) {
            return "Dairy production has a notable environmental footprint. Switch to plant-based milk alternatives like oat, soy, or almond milk for your coffee and cereal, and experiment with egg replacements in baking.";
        } else if (lowerPrompt.contains("coffee")) {
            return "Coffee cultivation has high land and water footprints. Avoid waste by brewing only what you intend to drink, keeping leftovers in a thermos instead of on a heated burner, and choosing shade-grown, organic, or Fairtrade certified beans.";
        } else if (lowerPrompt.contains("vegetables") || lowerPrompt.contains("fruit") || lowerPrompt.contains("vegetarian") || lowerPrompt.contains("vegan")) {
            return "Fruits and vegetables are excellent low-carbon food choices. Minimize their impact even further by buying local, seasonal produce to reduce transportation food miles, and always buy only what you need to prevent food waste.";
            
        // Shopping Tips
        } else if (lowerPrompt.contains("clothing_new") || lowerPrompt.contains("clothing") || lowerPrompt.contains("clothes")) {
            return "New garments carry a massive manufacturing and supply-chain footprint. Extend the lifecycle of your clothes by caring for them properly, hosting clothing swaps with friends, shopping vintage, or choosing certified sustainable brands.";
        } else if (lowerPrompt.contains("clothing_second")) {
            return "Purchasing second-hand is a superb way to support the circular economy. Continue this habit by donating items you no longer wear, repairing damaged clothing, and choosing durable fabrics that last.";
        } else if (lowerPrompt.contains("smartphone") || lowerPrompt.contains("laptop") || lowerPrompt.contains("tv") || lowerPrompt.contains("electronics")) {
            return "Manufacturing electronics requires intensive resource extraction. Extend the life of your devices by keeping them updated, repairing them instead of upgrading immediately, and choosing refurbished electronics when replacement is necessary.";
        } else if (lowerPrompt.contains("furniture")) {
            return "Make long-term sustainable choices by selecting durable, vintage, or second-hand furniture. If buying new, look for FSC-certified wood to ensure it comes from responsibly managed forests that keep carbon stored.";
        } else if (lowerPrompt.contains("books")) {
            return "Books carry a carbon footprint from paper manufacturing and transport. Try borrowing from your local library, buying second-hand, or switching to an e-reader to read paper-free and lower your literary footprint.";
        }
        
        // General fallback categories
        if (lowerPrompt.contains("car") || lowerPrompt.contains("transport")) {
            return "Transportation emissions are a major component of personal carbon footprints. Try to walk or bicycle for short trips under 2 km, use public bus or rail transit where possible, and drive at moderate, steady speeds.";
        } else if (lowerPrompt.contains("energy")) {
            return "Household energy usage is driven by heating, cooling, and appliances. Switch off unused lights, shift appliance usage to off-peak hours, adjust your thermostat by 1-2 degrees, and use energy-efficient appliances.";
        } else if (lowerPrompt.contains("food")) {
            return "Food production accounts for over a quarter of global emissions. Minimize your footprint by eating more plant-based meals, planning shopping lists in advance to avoid waste, and choosing organic and locally sourced ingredients.";
        } else if (lowerPrompt.contains("shopping")) {
            return "Every physical product has a manufacturing footprint. Adopt a circular mindset: choose durable goods, rent or borrow items you use rarely, shop second-hand, and repair damaged items instead of discarding them.";
        }
        
        return "Small changes can lead to a big environmental impact. Consider reducing this activity slightly next week, finding energy-efficient alternatives, or sharing resources to lower your personal carbon footprint.";
    }
}
