import CreativeLearingIcon from '@mui/icons-material/EmojiObjects';
import SafeEnvironmentIcon from '@mui/icons-material/Favorite';
import ExpertTeacherIcon from '@mui/icons-material/School';
import FunActivitiesIcon from '@mui/icons-material/Celebration';
import FounderImage from '../../public/assets/about/director.jpg'
import { AboutFeature, FounderMessage } from '@/types/about-types';
import schoolDetails from '@/json/schooldetails';

export const aboutFeaturesEng: AboutFeature[] = [
  {
    icon: CreativeLearingIcon,
    title: "Creative Learning",
    description: "We believe in fostering creativity and imagination through hands-on activities that encourage exploration and self-expression."
  },
  {
    icon: SafeEnvironmentIcon,
    title: "Safe Environment",
    description: "A secure, nurturing space where every child feels valued, respected, and free to express themselves and learn at their own pace."
  },
  {
    icon: ExpertTeacherIcon,
    title: "Expert Teachers",
    description: "Our dedicated team of experienced educators is trained in child development and committed to providing personalized attention to each child."
  },
  {
    icon: FunActivitiesIcon,
    title: "Fun Activities",
    description: "Learning through play is our core philosophy. We design engaging activities that make education enjoyable and memorable for every child."
  }
];

export const founderMessageEng: FounderMessage = {
  name: schoolDetails.director.name,
  position: schoolDetails.director.designation,
  message: `As an educator with over 15 years of experience, I founded ${schoolDetails.name} with a vision to create a space where children can learn, grow, and thrive. Our approach combines modern educational methods with traditional values, ensuring each child receives the foundation they need for future success.`,
  image: FounderImage
};
