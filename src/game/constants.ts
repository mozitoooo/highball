export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 240;
export const SCALE = 2;
export const DISPLAY_WIDTH = GAME_WIDTH * SCALE;
export const DISPLAY_HEIGHT = GAME_HEIGHT * SCALE;

export const MIDPOINT_X = GAME_WIDTH / 2;
export const FLOOR_SURFACE_Y = 210;
export const BED_SURFACE_Y = 180;
export const SURFACE_Y = FLOOR_SURFACE_Y;

export const PLAYER_WIDTH = 16;
export const PLAYER_HEIGHT = 24;
export const PLAYER_HITBOX_WIDTH = 20;
export const PLAYER_HITBOX_HEIGHT = 28;
export const PLAYER_SPEED = 120;

export const BALL_RADIUS = 5;
export const CATCH_RADIUS = 20;

export const GRAVITY = 420;
export const BALL_VX_MIN = 140;
export const BALL_VX_MAX = 220;
export const BALL_VY_MIN = -320;
export const BALL_VY_MAX = -240;

export const FLOOR_PLAYER_MIN_X = 8;
export const FLOOR_PLAYER_MAX_X = MIDPOINT_X - PLAYER_WIDTH - 8;
export const BED_PLAYER_MIN_X = MIDPOINT_X + 8;
export const BED_PLAYER_MAX_X = GAME_WIDTH - PLAYER_WIDTH - 8;

export const WINNING_SCORE = 5;
export const COUNTDOWN_DURATION = 3;
export const SCORED_PAUSE = 1.2;

export const COLORS = {
  wall: '#FCE4B0',
  wallAccent: '#E8C878',
  wallTrim: '#C0A060',
  floorDark: '#8B6914',
  floorLight: '#A07818',
  floorLine: '#705810',
  windowFrame: '#806030',
  windowGlass: '#80C8F0',
  curtain: '#C04040',
  bedFrame: '#5C3A1E',
  bedFrameLight: '#7A5030',
  bedBorder: '#6B4910',
  mattress: '#F0E8D8',
  blanket: '#2860B0',
  blanketStripe: '#3878D0',
  pillow: '#F8F0E0',
  pillowShade: '#E8E0D0',
  playerFloor: '#30A030',
  playerFloorDark: '#208020',
  playerBed: '#FFE040',
  playerBedDark: '#CCA000',
  skin: '#F0B080',
  hair: '#503020',
  pants: '#3040A0',
  ball: '#F8F8F8',
  ballDetail: '#C8C8C8',
  net: '#808080',
  netPost: '#505050',
  scoreBg: '#182030',
  scoreBorder: '#405060',
  scoreText: '#F8F8F0',
  textLight: '#F8F8F0',
  catchHighlight: 'rgba(248, 224, 48, 0.3)',
};
