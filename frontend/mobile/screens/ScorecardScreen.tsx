import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ScorecardScreen: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [scores, setScores] = useState({});

    const categories = [
        { value: 'career', label: '💼 Career' },
        { value: 'relationships', label: '❤️ Relationships' },
        { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
        { value: 'investments', label: '📈 Investments' }
    ];

    const pillars = [
        {
            id: 'planning',
            name: 'Planning',
            question: 'Did you have a budget, fund, or plan?'
        },
        {
            id: 'research',
            name: 'Research',
            question: 'Did you explore alternatives and gather information?'
        },
        {
            id: 'timing',
            name: 'Timing',
            question: 'Did you act at the right time?'
        },
        {
            id: 'emotional',
            name: 'Emotional Control',
            question: 'Were you calm and rational?'
        }
    ];

    const handleScoreChange = (pillarId: string, score: number) => {
        setScores(prev => ({ ...prev, [pillarId]: score }));
    };

    const calculateTotalScore = () => {
        return Object.values(scores).reduce((sum: number, s: any) => sum + s, 0);
    };

    const saveScorecard = async () => {
        try {
            const scorecardData = {
                id: Date.now().toString(),
                category,
                title,
                scores: Object.entries(scores).map(([pillarId, score]) => ({
                    pillarName: pillars.find(p => p.id === pillarId)?.name,
                    score
                })),
                totalScore: calculateTotalScore(),
                date: new Date().toISOString()
            };

            // Save locally
            const existing = await AsyncStorage.getItem('scorecards');
            const scorecards = existing ? JSON.parse(existing) : [];
            scorecards.push(scorecardData);
            await AsyncStorage.setItem('scorecards', JSON.stringify(scorecards));

            // Sync with Azure
            await syncWithAzure(scorecardData);

            Alert.alert('Success', 'Scorecard saved successfully!');
            setCurrentStep(3);
        } catch (error) {
            Alert.alert('Error', 'Failed to save scorecard');
        }
    };

    const syncWithAzure = async (data: any) => {
        try {
            await fetch('https://your-function-app.azurewebsites.net/api/create-scorecard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Sync failed, will retry later:', error);
            // Queue for later sync
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>What type of decision?</Text>

                        <Picker
                            selectedValue={category}
                            onValueChange={setCategory}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select a category..." value="" />
                            {categories.map(cat => (
                                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                            ))}
                        </Picker>

                        <TextInput
                            style={styles.input}
                            placeholder="Decision title"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <TouchableOpacity
                            style={[styles.button, (!category || !title) && styles.buttonDisabled]}
                            onPress={() => setCurrentStep(1)}
                            disabled={!category || !title}
                        >
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 1:
                return (
                    <ScrollView style={styles.stepContainer}>
                        <Text style={styles.title}>Score Each Pillar</Text>

                        {pillars.map(pillar => (
                            <View key={pillar.id} style={styles.pillarCard}>
                                <Text style={styles.pillarName}>{pillar.name}</Text>
                                <Text style={styles.pillarQuestion}>{pillar.question}</Text>

                                <View style={styles.scoreButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.scoreButton,
                                            scores[pillar.id] === 1 && styles.selectedGood
                                        ]}
                                        onPress={() => handleScoreChange(pillar.id, 1)}
                                    >
                                        <Text style={styles.scoreButtonText}>✅ Good</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.scoreButton,
                                            scores[pillar.id] === 0 && styles.selectedBad
                                        ]}
                                        onPress={() => handleScoreChange(pillar.id, 0)}
                                    >
                                        <Text style={styles.scoreButtonText}>⚠️ Bad</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.scoreButton,
                                            scores[pillar.id] === -1 && styles.selectedUgly
                                        ]}
                                        onPress={() => handleScoreChange(pillar.id, -1)}
                                    >
                                        <Text style={styles.scoreButtonText}>❌ Ugly</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSecondary]}
                                onPress={() => setCurrentStep(0)}
                            >
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonPrimary]}
                                onPress={() => setCurrentStep(2)}
                            >
                                <Text style={styles.buttonText}>Review</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                );

            case 2:
                const total = calculateTotalScore();
                const verdict = total >= 3 ? 'Excellent' :
                    total >= 1 ? 'Acceptable' :
                        total === 0 ? 'Borderline' :
                            total >= -2 ? 'Poor' : 'Critical';

                return (
                    <ScrollView style={styles.stepContainer}>
                        <Text style={styles.title}>Review Your Scorecard</Text>

                        <View style={[styles.verdictCard,
                        total >= 1 ? styles.verdictSuccess :
                            total >= -1 ? styles.verdictWarning : styles.verdictError
                        ]}>
                            <Text style={styles.verdictText}>Total Score: {total}</Text>
                            <Text style={styles.verdictText}>Verdict: {verdict}</Text>
                        </View>

                        {pillars.map(pillar => (
                            <View key={pillar.id} style={styles.reviewItem}>
                                <Text style={styles.reviewPillar}>{pillar.name}</Text>
                                <Text style={styles.reviewScore}>
                                    Score: {scores[pillar.id] === 1 ? '✅ Good' :
                                        scores[pillar.id] === 0 ? '⚠️ Bad' : '❌ Ugly'}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSecondary]}
                                onPress={() => setCurrentStep(1)}
                            >
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonPrimary]}
                                onPress={saveScorecard}
                            >
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                );

            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>🎉 Scorecard Saved!</Text>
                        <Text style={styles.message}>
                            Your decision has been analyzed and saved.
                        </Text>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonPrimary]}
                            onPress={() => {
                                setCurrentStep(0);
                                setCategory('');
                                setTitle('');
                                setScores({});
                            }}
                        >
                            <Text style={styles.buttonText}>New Scorecard</Text>
                        </TouchableOpacity>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>🎯 UDAS</Text>
                <Text style={styles.stepIndicator}>Step {currentStep + 1} of 4</Text>
            </View>

            {renderStep()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    header: {
        padding: 20,
        backgroundColor: '#2196f3',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
    },
    stepIndicator: {
        color: 'white',
        fontSize: 14
    },
    stepContainer: {
        flex: 1,
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333'
    },
    picker: {
        backgroundColor: 'white',
        marginBottom: 15,
        borderRadius: 8
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16
    },
    button: {
        backgroundColor: '#2196f3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1
    },
    buttonDisabled: {
        backgroundColor: '#ccc'
    },
    buttonPrimary: {
        backgroundColor: '#2196f3'
    },
    buttonSecondary: {
        backgroundColor: '#757575'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 20
    },
    pillarCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15
    },
    pillarName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    pillarQuestion: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10
    },
    scoreButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10
    },
    scoreButton: {
        flex: 1,
        padding: 10,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        alignItems: 'center'
    },
    selectedGood: {
        backgroundColor: '#4caf50'
    },
    selectedBad: {
        backgroundColor: '#ff9800'
    },
    selectedUgly: {
        backgroundColor: '#f44336'
    },
    scoreButtonText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    verdictCard: {
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center'
    },
    verdictSuccess: {
        backgroundColor: '#4caf50'
    },
    verdictWarning: {
        backgroundColor: '#ff9800'
    },
    verdictError: {
        backgroundColor: '#f44336'
    },
    verdictText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 2
    },
    reviewItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10
    },
    reviewPillar: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5
    },
    reviewScore: {
        fontSize: 14,
        color: '#666'
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginVertical: 20
    }
});