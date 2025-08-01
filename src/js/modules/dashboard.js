export class DashboardModule {
    constructor(app) {
        this.app = app;
        this.state = app.state;
        this.elements = app.elements;
    }

    initialize() {
        this.updateTodaySpecial();
        this.load86Items();
    }

    updateTodaySpecial() {
        const today = new Date().getDay();
        const specials = {
            0: { // Sunday
                title: "Sunday Steak Night",
                time: "4p – 8p",
                description: "Garden Salad • Steak Frites • Glass of House Wine",
                price: "$40"
            },
            3: { // Wednesday
                title: "Date Night",
                time: "4p – 8p", 
                description: "2-Dine for $89 • 3-Course Menu • $5 Draft Beer • $10 House Wine",
                price: "$89"
            },
            4: { // Thursday
                title: "1837 Bar & Burger Night",
                time: "4p – 8p",
                description: "$12.50 Signature Burger OR Crispy Chicken • $5 Draft Beer • $10 House Wine",
                price: "$12.50"
            },
            5: { // Friday
                title: "Late Night Happy Hour",
                time: "8p – 11p",
                description: "$5 Draft Beer • $10 House Wines • $10 House Winner Cocktails • $2 Off Curated Cocktails",
                price: "Various"
            },
            6: { // Saturday
                title: "Late Night Happy Hour", 
                time: "8p – 11p",
                description: "$5 Draft Beer • $10 House Wines • $10 House Winner Cocktails • $2 Off Curated Cocktails",
                price: "Various"
            }
        };

        const special = specials[today];
        const todaySpecial = document.getElementById('todaySpecial');
        if (!todaySpecial) return;

        if (special) {
            todaySpecial.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h4 class="text-xl font-bold">${special.title}</h4>
                    <span class="text-lg font-bold text-yellow-400">${special.price}</span>
                </div>
                <p class="text-sm text-gray-400 mb-2">${special.time}</p>
                <p class="text-gray-300">${special.description}</p>
            `;
        } else {
            todaySpecial.innerHTML = `
                <p class="text-gray-300">No special offerings today. Check back tomorrow!</p>
            `;
        }
    }

    load86Items() {
        const alert86List = document.getElementById('alert86List');
        if (!alert86List) return;

        if (this.state.items86.length === 0) {
            alert86List.innerHTML = '<p class="text-gray-300">No items currently 86\'d</p>';
            return;
        }
        
        alert86List.innerHTML = this.state.items86.map(item => `
            <div class="mb-2">
                <span class="font-semibold text-red-300">${item.name}</span>
                <span class="text-sm text-gray-400 ml-2">- ${item.timestamp}</span>
            </div>
        `).join('');
    }
} 