const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

function generateRandomItem(){
    const baseItems = [
        {name: "Iron LongSword", type: "Sword", strength: 5, health: 15},
        {name: "Elven Bow", type: "Bow", strength: 5, health: 15},
        {name: "Wooden Staff", type: "Staff", strength: 5, health: 15},
        {name: "Handgun", type: "Gun", strength: 5, health: 15},
        {name: "Iron Breastplate", type: "Chestplate", strength: 2, health: 60},
        {name: "Iron Leggings", type: "Leggings", strength: 2, health: 60},
        {name: "Leather Gloves", type: "Gloves", strength: 3, health: 30},
        {name: "Leather Boots", type: "Boots", strength: 2, health: 30},
        {name: "Ring of vitality",type: "Ring", strength: 0, health: 90},
        {name: "Iron Helmet", type: "Helm", strength: 2, health: 60},
        {name: "Frostbane Echo", type: "Sword", strength: 15, health: 5},
        {name: "Sage's bind", type: "Ring", strength: 7, health: 7},
    ]

    // Roll for rarity
    const roll = Math.random() * 100;
    let rarity = 'Common';
    let scale = 1;

    if (roll > 92) {
        rarity = 'Legendary';
        scale = 3;
    } else if (roll > 68) {
        rarity = 'Rare';
        scale = 2;
    }

// Pick a random base item
const base = baseItems[Math.floor(Math.random() * baseItems.length)];

// Scale stats based on rarity
const bonusStr = Math.round(base.strength * scale);
const bonusHp = Math.round(base.health * scale);

    return {
        name: base.name,
        type: base.type,
        rarity,
        bonusStr,
        bonusHp,
    };
}

// POST /reward/item
router.post('/', async (req, res) => {
    try {
        const itemData = generateRandomItem();

        const newItem = await prisma.item.create({
            data: itemData
        });

        res.status(201).json({
            message: "Item reward generated!",
            item: newItem
        });
    } catch (err) {
        console.error("Item creation error:", err);
        res.status(500).json({ error: "Failed to create item.", details: err.message });
    }
});

module.exports = router;