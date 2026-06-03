/**
 * TarotFlow Card Image Registry
 * Maps English card names (as returned by the backend) to local image assets.
 * All images are Rider-Waite-Smith 1909 public domain scans.
 */

// Static require map — React Native requires static paths for bundled assets
const CARD_IMAGES: Record<string, any> = {
  // Major Arcana
  'The Fool': require('../../assets/cards/major_00_the_fool.jpg'),
  'The Magician': require('../../assets/cards/major_01_the_magician.jpg'),
  'The High Priestess': require('../../assets/cards/major_02_the_high_priestess.jpg'),
  'The Empress': require('../../assets/cards/major_03_the_empress.jpg'),
  'The Emperor': require('../../assets/cards/major_04_the_emperor.jpg'),
  'The Hierophant': require('../../assets/cards/major_05_the_hierophant.jpg'),
  'The Lovers': require('../../assets/cards/major_06_the_lovers.jpg'),
  'The Chariot': require('../../assets/cards/major_07_the_chariot.jpg'),
  'Strength': require('../../assets/cards/major_08_strength.jpg'),
  'The Hermit': require('../../assets/cards/major_09_the_hermit.jpg'),
  'Wheel of Fortune': require('../../assets/cards/major_10_wheel_of_fortune.jpg'),
  'Justice': require('../../assets/cards/major_11_justice.jpg'),
  'The Hanged Man': require('../../assets/cards/major_12_the_hanged_man.jpg'),
  'Death': require('../../assets/cards/major_13_death.jpg'),
  'Temperance': require('../../assets/cards/major_14_temperance.jpg'),
  'The Devil': require('../../assets/cards/major_15_the_devil.jpg'),
  'The Tower': require('../../assets/cards/major_16_the_tower.jpg'),
  'The Star': require('../../assets/cards/major_17_the_star.jpg'),
  'The Moon': require('../../assets/cards/major_18_the_moon.jpg'),
  'The Sun': require('../../assets/cards/major_19_the_sun.jpg'),
  'Judgement': require('../../assets/cards/major_20_judgement.jpg'),
  'The World': require('../../assets/cards/major_21_the_world.jpg'),

  // Wands
  'Ace of Wands': require('../../assets/cards/wands_01.jpg'),
  'Two of Wands': require('../../assets/cards/wands_02.jpg'),
  'Three of Wands': require('../../assets/cards/wands_03.jpg'),
  'Four of Wands': require('../../assets/cards/wands_04.jpg'),
  'Five of Wands': require('../../assets/cards/wands_05.jpg'),
  'Six of Wands': require('../../assets/cards/wands_06.jpg'),
  'Seven of Wands': require('../../assets/cards/wands_07.jpg'),
  'Eight of Wands': require('../../assets/cards/wands_08.jpg'),
  'Nine of Wands': require('../../assets/cards/wands_09.jpg'),
  'Ten of Wands': require('../../assets/cards/wands_10.jpg'),
  'Page of Wands': require('../../assets/cards/wands_page.jpg'),
  'Knight of Wands': require('../../assets/cards/wands_knight.jpg'),
  'Queen of Wands': require('../../assets/cards/wands_queen.jpg'),
  'King of Wands': require('../../assets/cards/wands_king.jpg'),

  // Cups
  'Ace of Cups': require('../../assets/cards/cups_01.jpg'),
  'Two of Cups': require('../../assets/cards/cups_02.jpg'),
  'Three of Cups': require('../../assets/cards/cups_03.jpg'),
  'Four of Cups': require('../../assets/cards/cups_04.jpg'),
  'Five of Cups': require('../../assets/cards/cups_05.jpg'),
  'Six of Cups': require('../../assets/cards/cups_06.jpg'),
  'Seven of Cups': require('../../assets/cards/cups_07.jpg'),
  'Eight of Cups': require('../../assets/cards/cups_08.jpg'),
  'Nine of Cups': require('../../assets/cards/cups_09.jpg'),
  'Ten of Cups': require('../../assets/cards/cups_10.jpg'),
  'Page of Cups': require('../../assets/cards/cups_page.jpg'),
  'Knight of Cups': require('../../assets/cards/cups_knight.jpg'),
  'Queen of Cups': require('../../assets/cards/cups_queen.jpg'),
  'King of Cups': require('../../assets/cards/cups_king.jpg'),

  // Swords
  'Ace of Swords': require('../../assets/cards/swords_01.jpg'),
  'Two of Swords': require('../../assets/cards/swords_02.jpg'),
  'Three of Swords': require('../../assets/cards/swords_03.jpg'),
  'Four of Swords': require('../../assets/cards/swords_04.jpg'),
  'Five of Swords': require('../../assets/cards/swords_05.jpg'),
  'Six of Swords': require('../../assets/cards/swords_06.jpg'),
  'Seven of Swords': require('../../assets/cards/swords_07.jpg'),
  'Eight of Swords': require('../../assets/cards/swords_08.jpg'),
  'Nine of Swords': require('../../assets/cards/swords_09.jpg'),
  'Ten of Swords': require('../../assets/cards/swords_10.jpg'),
  'Page of Swords': require('../../assets/cards/swords_page.jpg'),
  'Knight of Swords': require('../../assets/cards/swords_knight.jpg'),
  'Queen of Swords': require('../../assets/cards/swords_queen.jpg'),
  'King of Swords': require('../../assets/cards/swords_king.jpg'),

  // Pentacles
  'Ace of Pentacles': require('../../assets/cards/pentacles_01.jpg'),
  'Two of Pentacles': require('../../assets/cards/pentacles_02.jpg'),
  'Three of Pentacles': require('../../assets/cards/pentacles_03.jpg'),
  'Four of Pentacles': require('../../assets/cards/pentacles_04.jpg'),
  'Five of Pentacles': require('../../assets/cards/pentacles_05.jpg'),
  'Six of Pentacles': require('../../assets/cards/pentacles_06.jpg'),
  'Seven of Pentacles': require('../../assets/cards/pentacles_07.jpg'),
  'Eight of Pentacles': require('../../assets/cards/pentacles_08.jpg'),
  'Nine of Pentacles': require('../../assets/cards/pentacles_09.jpg'),
  'Ten of Pentacles': require('../../assets/cards/pentacles_10.jpg'),
  'Page of Pentacles': require('../../assets/cards/pentacles_page.jpg'),
  'Knight of Pentacles': require('../../assets/cards/pentacles_knight.jpg'),
  'Queen of Pentacles': require('../../assets/cards/pentacles_queen.jpg'),
  'King of Pentacles': require('../../assets/cards/pentacles_king.jpg'),
};

/**
 * Get the local image source for a card name.
 * Returns null if card name doesn't match any known card.
 */
export function getCardImage(cardName: string): any | null {
  return CARD_IMAGES[cardName] || null;
}

export default CARD_IMAGES;
