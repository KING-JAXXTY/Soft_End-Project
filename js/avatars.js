// Avatar URL mappings
const AVATAR_URLS = {
    avatar1: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortFlat&accessoriesType=Round&hairColor=Blonde&facialHairType=BeardLight&facialHairColor=Auburn&clotheType=ShirtVNeck&clotheColor=Black&eyeType=Squint&eyebrowType=Default&mouthType=Smile&skinColor=Light',
    avatar2: 'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairMiaWallace&accessoriesType=Blank&hairColor=Platinum&facialHairType=Blank&clotheType=ShirtScoopNeck&clotheColor=Gray02&eyeType=Default&eyebrowType=Default&mouthType=Serious&skinColor=Light',
    avatar3: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairDreads01&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Gray02&eyeType=Side&eyebrowType=Default&mouthType=Twinkle&skinColor=Black',
    avatar4: 'https://avataaars.io/?avatarStyle=Transparent&topType=Hijab&accessoriesType=Round&hatColor=Blue03&clotheType=ShirtVNeck&clotheColor=Gray02&eyeType=Squint&eyebrowType=Default&mouthType=Twinkle&skinColor=Brown',
    avatar5: 'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairBun&accessoriesType=Prescription02&hairColor=PastelPink&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light',
    avatar6: 'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairNotTooLong&accessoriesType=Blank&hairColor=SilverGray&facialHairType=Blank&clotheType=Hoodie&clotheColor=Heather&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Serious&skinColor=DarkBrown',
    avatar7: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairTheCaesarSidePart&accessoriesType=Blank&hairColor=Red&facialHairType=BeardMedium&facialHairColor=Black&clotheType=BlazerSweater&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Twinkle&skinColor=Tanned',
    avatar8: 'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairShavedSides&accessoriesType=Blank&facialHairType=BeardMedium&facialHairColor=BlondeGolden&clotheType=ShirtScoopNeck&clotheColor=Gray02&eyeType=Default&eyebrowType=UpDown&mouthType=Serious&skinColor=Pale',
    avatar9: 'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairFroBand&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=ShirtScoopNeck&clotheColor=Gray02&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Twinkle&skinColor=Black',
    avatar10: 'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairDreads&accessoriesType=Blank&hairColor=Brown&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Smile&skinColor=Brown',
    avatar11: 'https://avataaars.io/?avatarStyle=Transparent&topType=NoHair&accessoriesType=Blank&facialHairType=BeardMajestic&facialHairColor=Red&clotheType=CollarSweater&clotheColor=Gray02&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Serious&skinColor=Pale',
    avatar12: 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortFlat&accessoriesType=Blank&hairColor=BrownDark&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=ShirtCrewNeck&clotheColor=Black&eyeType=Side&eyebrowType=Default&mouthType=Eating&skinColor=DarkBrown'
};

// Get avatar URL from avatar ID
function getAvatarUrl(avatarId) {
    return AVATAR_URLS[avatarId] || AVATAR_URLS.avatar1;
}
