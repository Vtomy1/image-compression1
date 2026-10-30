import sampleLandscape from '../assets/images/sample_landscape_scenery_1793323375571.jpg';
import sampleArchitecture from '../assets/images/sample_architecture_lines_1793323376279.jpg';
import sampleCamera from '../assets/images/sample_studio_camera_1793323376502.jpg';

export interface SampleImageDef {
  id: string;
  name: string;
  url: string;
  description: string;
  targetFormat: 'image/webp' | 'image/jpeg' | 'image/png';
}

export const SAMPLE_IMAGES: SampleImageDef[] = [
  {
    id: 'sample-1',
    name: 'alpine_glacial_lake_scenery.jpg',
    url: sampleLandscape,
    description: 'High dynamic range landscape with water reflections and fine pine needles (16:9)',
    targetFormat: 'image/webp',
  },
  {
    id: 'sample-2',
    name: 'brutalist_forum_architecture.jpg',
    url: sampleArchitecture,
    description: 'Sharp concrete facades, textured glass panels and urban geometry (4:3)',
    targetFormat: 'image/webp',
  },
  {
    id: 'sample-3',
    name: 'vintage_camera_macro_studio.jpg',
    url: sampleCamera,
    description: 'Studio macro product photography with knurled metal and lens reflections (1:1)',
    targetFormat: 'image/jpeg',
  },
];
