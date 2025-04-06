const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.patch('/:id', async (req, res) => {
const characterId = parseInt(req.params.id);
const { itemId } = req.body;

try {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
    return res.status(404).json({ error: "Item not found." });
    }

    const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: {
        id: true,
        name: true,
        weapon: true, // character's weapon preference
        type: true
    }
    });

    if (!character) {
    return res.status(404).json({ error: "Character not found." });
    }

    const typeMap = {
    weapon: "weaponId",
    chestplate: "chestId",
    pants: "pantsId",
    boots: "bootsId",
    gloves: "glovesId",
    helm: "helmId",
    ring: "ringId"
    };

    const itemType = item.type.toLowerCase();
    const slotKey = typeMap[itemType];

    if (!slotKey) {
    return res.status(400).json({ error: `Invalid item type: ${item.type}` });
    }

    // Enforce weapon preference
    if (slotKey === "weaponId") {
    const preferredWeapon = character.weapon?.toLowerCase();
    if (itemType !== preferredWeapon) {
        return res.status(403).json({
        error: `${character.name} prefers ${character.weapon}s and cannot equip a ${item.type}.`
        });
    }
    }

    const updatedCharacter = await prisma.character.update({
    where: { id: characterId },
    data: { [slotKey]: item.id },
    include: {
        weapon: true,
        ring: true,
        helm: true,
        gloves: true,
        chest: true,
        pants: true,
        boots: true
    }
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
