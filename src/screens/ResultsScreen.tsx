import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  Chip,
} from 'react-native-paper';
import {
  DollarSign,
  Leaf,
  Share2,
  CheckCircle,
  Heart,
  Recycle,
} from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ScannedItem } from '../types';
import { ApiService } from '../services/api';
import { theme, spacing } from '../utils/theme';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface Props {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
}

export default function ResultsScreen({ navigation, route }: Props) {
  const { item } = route.params;
  const [selectedAction, setSelectedAction] = useState<'sell' | 'donate' | 'recycle' | null>(null);

  const handleAction = async (action: 'sell' | 'donate' | 'recycle') => {
    setSelectedAction(action);
    
    // Save the item with the chosen action
    const updatedItem = { ...item, action };
    await ApiService.saveItem(updatedItem);
    
    // Show success message
    Alert.alert(
      'Great Choice! 🌱',
      `You chose to ${action} your ${item.name}. This helps reduce waste and supports sustainability!`,
      [
        {
          text: 'View History',
          onPress: () => navigation.navigate('Dashboard'),
        },
        {
          text: 'Scan Another',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Linking.openURL(`https://example.com/share?item=${encodeURIComponent(item.name)}&value=${item.value}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to open share link');
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'sell':
        return <DollarSign size={20} color="white" />;
      case 'donate':
        return <Heart size={20} color="white" />;
      case 'recycle':
        return <Recycle size={20} color="white" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'sell':
        return theme.colors.success;
      case 'donate':
        return '#E91E63';
      case 'recycle':
        return theme.colors.primary;
      default:
        return theme.colors.disabled;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <CheckCircle size={48} color={theme.colors.success} />
        <Title style={styles.title}>Analysis Complete!</Title>
        <Paragraph style={styles.subtitle}>
          Here's what we found about your item
        </Paragraph>
      </View>

      {item.imageUri && (
        <Card style={styles.imageCard}>
          <Image source={{ uri: item.imageUri }} style={styles.image} />
        </Card>
      )}

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.itemName}>{item.name}</Title>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <DollarSign size={24} color={theme.colors.success} />
              <Text style={styles.statValue}>${item.value}</Text>
              <Text style={styles.statLabel}>Estimated Value</Text>
            </View>
            
            <View style={styles.statItem}>
              <Leaf size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{item.ecoImpact}</Text>
              <Text style={styles.statLabel}>Eco Impact</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.actionsTitle}>What would you like to do?</Title>
          <Paragraph style={styles.actionsDescription}>
            Choose an action to help reduce waste and maximize value
          </Paragraph>
          
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={() => handleAction('sell')}
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              icon={() => getActionIcon('sell')}
              loading={selectedAction === 'sell'}
              disabled={selectedAction !== null}
            >
              Sell
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleAction('donate')}
              style={[styles.actionButton, { backgroundColor: '#E91E63' }]}
              icon={() => getActionIcon('donate')}
              loading={selectedAction === 'donate'}
              disabled={selectedAction !== null}
            >
              Donate
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleAction('recycle')}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              icon={() => getActionIcon('recycle')}
              loading={selectedAction === 'recycle'}
              disabled={selectedAction !== null}
            >
              Recycle
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.shareCard}>
        <Card.Content>
          <Title style={styles.shareTitle}>Share Your Impact</Title>
          <Paragraph style={styles.shareDescription}>
            Let others know about your sustainable choice!
          </Paragraph>
          
          <Button
            mode="outlined"
            onPress={handleShare}
            icon={() => <Share2 size={20} color={theme.colors.primary} />}
            style={styles.shareButton}
          >
            Share on Social Media
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footerButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Home')}
          style={styles.footerButton}
        >
          Scan Another Item
        </Button>
        
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Dashboard')}
          style={styles.footerButton}
        >
          View History
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text,
  },
  imageCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: theme.roundness,
  },
  infoCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#E8F5E8',
  },
  itemName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: theme.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  actionsCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  actionsDescription: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: spacing.lg,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  shareCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#F3E5F5',
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  shareDescription: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: spacing.md,
  },
  shareButton: {
    alignSelf: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
