const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

function generateRandomCharacter() {
    const baseCharacters = [
        { name: "Orion", weapon: "Sword", species: "Human", strength: 5 , health: 100},
        { name: "Kaela", weapon: "Bow", species: "Elf", strength: 3 , health: 90},
        { name: "Zarun", weapon: "Sword", species: "Dragonkin", strength: 6 , health: 100},
        { name: "Liora", weapon: "Staff", species: "Mage", strength: 4 , health: 70},
        { name: "Seraphina", weapon: "Staff", species: "Mage", strength: 3 , health: 80},
        { name: "Isolde", weapon: "Staff", species: "Mage", strength: 2 , health: 80},
        { name: "Silvara", weapon: "Bow", species: "Elf", strength: 5 , health: 70},
        { name: "Alaric", weapon: "Sword", species: "Elf", strength: 2 , health: 120},
        { name: "Bayo", weapon: "Gun", species: "Human", strength: 4 , health: 60},
        { name: "Laeretia", weapon: "Gun", species: "Human", strength: 2 , health: 80},
        { name: "Rakella", weapon: "Sword", species: "Human", strength: 7 , health: 60},
        { name: "Shatrina", weapon: "Bow", species: "Human", strength: 2 , health: 80},
        { name: "Thurinrod", weapon: "Staff", species: "Elf", strength: 4 , health: 70},
        { name: "Ulrandir", weapon: "Bow", species: "Elf", strength: 3 , health: 60},
        { name: "Haldor", weapon: "Bow", species: "Elf", strength: 3 , health: 60},
        { name: "Larethian", weapon: "Sword", species: "Elf", strength: 4 , health: 70},
        { name: "Ikarus", weapon: "Sword", species: "Dragonkin", strength: 3 , health: 80},
        { name: "Vasuki", weapon: "Sword", species: "Dragonkin", strength: 5 , health: 70},
        { name: "Yolon", weapon: "Sword", species: "Dragonkin", strength: 2 , health: 120},
        { name: "Bren", weapon: "Gun", species: "Human", strength: 3 , health: 70},
        { name: "Nykka", weapon: "Gun", species: "Human", strength: 6 , health: 60}
    ];

    //Roll for rarity
    const roll = Math.random() * 100;
    let rarity = 'Common';

    if (roll > 90) rarity = 'Legendary';
    else if (roll > 65) rarity = 'Rare';

    //Pick a base character
    const base = baseCharacters[Math.floor(Math.random() * baseCharacters.length)];

    //Scale stats based on rarity
    let scaledStrength = base.strength;
    let scaledHealth = base.health;
    let mana = 50;

    if (rarity === 'Rare') {
        scaledStrength = Math.round(base.strength * 2);
        scaledHealth = Math.round(base.health * 2);
    } else if (rarity === 'Legendary') {
        scaledStrength = Math.round(base.strength * 1.5);
        scaledHealth = Math.round(base.health * 1.5);
    }

    //Return final character object
    return {
        name: base.name,
        species: base.species,
        weapon: base.weapon,
        type: rarity,
        strength: scaledStrength,
        health: scaledHealth,
        mana,
        level: 1,
        xp: 0,
    };
}

router.post('/', async (req, res) => {
    const { userId } = req.body;

    try {
    // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Generate new character
    const newCharacter = generateRandomCharacter();

    // Save to DB
    const character = await prisma.character.create({
        data: {
            userId,
            ...newCharacter
        }
    });

    res.status(201).json({
        message: "Gacha pull successful!",
        character
    });

    } catch (err) {
        console.error("Gacha error:", err);
        res.status(500).json({ error: "Something went wrong.", details: err.message });
    }
    
});

router.post('/:id/equip', async (req, res) => {
    const characterId = parseInt(req.params.id);
    const { itemId } = req.body;

    try {
        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item) {
            return res.status(404).json({ error: "Item not found." });
        }

        const character = await prisma.character.findUnique({ where: { id: characterId } });
        if (!character) {
            return res.status(404).json({ error: "Character not found." });
        }

        // Prepare update data based on item type
        const updateData = {};
        const typeMap = {
            weapon: "weaponId",
            chest: "chestId",
            pants: "pantsId",
            boots: "bootsId",
            gloves: "glovesId",
            helm: "helmId",
            ring: "ringId"
        };

        const slotKey = typeMap[item.type.toLowerCase()];
        if (!slotKey) {
            return res.status(400).json({ error: `Invalid item type: ${item.type}` });
        }

        updateData[slotKey] = item.id;

        // Equip the item by updating the character
        const updatedCharacter = await prisma.character.update({
            where: { id: characterId },
            data: updateData,
            include: { weapon: true, ring: true, helm: true, gloves: true, chest: true, pants: true, boots: true }
        });

        res.status(200).json({
            message: `Equipped ${item.name} to ${slotKey.replace("Id", "")}`,
            character: updatedCharacter
        });
    } catch (err) {
        console.error("Equip error:", err);
        res.status(500).json({ error: "Failed to equip item.", details: err.message });
    }
});


module.exports = router;