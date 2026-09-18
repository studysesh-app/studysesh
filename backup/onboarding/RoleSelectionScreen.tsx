import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, BookOpen, Users } from 'lucide-react-native';
import { RippleBackground } from '../RippleBackground';
import { AnimatedCard } from '../AnimatedCard';

interface RoleSelectionScreenProps {
  onBack: () => void;
  onSelectRole: (role: 'student' | 'tutor') => void;
}

export function RoleSelectionScreen({ onBack, onSelectRole }: RoleSelectionScreenProps) {
  return (
    <RippleBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.question}>
            How would you like to use studysesh?
          </Text>

          {/* Student Card */}
          <AnimatedCard
            onPress={() => onSelectRole('student')}
          >
            <View style={styles.cardContent}>
              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <BookOpen size={32} color="#db2321" strokeWidth={2} />
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>I'm a Student</Text>
                <Text style={styles.cardDescription}>Find tutors and book sessions</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Tutor Card */}
          <AnimatedCard
            onPress={() => onSelectRole('tutor')}
          >
            <View style={styles.cardContent}>
              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <Users size={32} color="#db2321" strokeWidth={2} />
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>I want to Tutor</Text>
                <Text style={styles.cardDescription}>Help students and earn money</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Footer Note */}
          <Text style={styles.footerText}>
            You can switch roles later in your profile
          </Text>
        </View>
      </View>
    </RippleBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  question: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  cardContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#db2321',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
