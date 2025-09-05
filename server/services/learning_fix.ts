// This is a working version of the personalizeContent method
private async personalizeContent(lesson: LearningLesson, chartData: any): Promise<LessonContent[]> {
  const content: LessonContent[] = [];
  
  if (!chartData) {
    // Generic content for users without birth data
    content.push({
      type: 'text',
      data: {
        content: 'To get personalized insights, please complete your birth information in your profile.'
      }
    });
  } else {
    // Personalized content based on chart data
    switch (lesson.track) {
      case 'basics':
        if (lesson.lessonNumber === 1) {
          content.push({
            type: 'text',
            data: {
              title: `Your ${chartData.sunSign} Sun`,
              content: this.getSunSignInsights(chartData.sunSign)
            }
          });
          content.push({
            type: 'interactive',
            data: {
              type: 'trait-explorer',
              sign: chartData.sunSign,
              element: 'sun'
            }
          });
        } else if (lesson.lessonNumber === 2 && lesson.title.includes('Moon')) {
          content.push({
            type: 'text',
            data: {
              title: `Your ${chartData.moonSign} Moon`,
              content: this.getMoonSignInsights(chartData.moonSign)
            }
          });
          content.push({
            type: 'interactive',
            data: {
              type: 'emotion-explorer',
              sign: chartData.moonSign,
              element: 'moon'
            }
          });
        } else if (lesson.title.includes('Elements') || lesson.title.includes('Fire, Earth, Air')) {
          const sunElement = this.getSignElement(chartData.sunSign);
          content.push({
            type: 'text',
            data: {
              title: `Your ${sunElement.charAt(0).toUpperCase() + sunElement.slice(1)} Element`,
              content: this.getPersonalizedElementIntro(chartData.sunSign, sunElement)
            }
          });
          content.push({
            type: 'text',
            data: {
              title: `The Four Elements in Astrology`,
              content: this.getElementsOverview()
            }
          });
          content.push({
            type: 'text',
            data: {
              title: `Your ${chartData.sunSign} Sun: ${sunElement.charAt(0).toUpperCase() + sunElement.slice(1)} Element Expression`,
              content: this.getElementExpression(chartData.sunSign, sunElement)
            }
          });
          content.push({
            type: 'interactive',
            data: {
              type: 'element-explorer',
              sign: chartData.sunSign,
              element: sunElement
            }
          });
        } else if (lesson.title.includes('Modalities') || lesson.title.includes('Cardinal, Fixed')) {
          const sunModality = this.getSignModality(chartData.sunSign);
          content.push({
            type: 'text',
            data: {
              title: `Your ${sunModality.charAt(0).toUpperCase() + sunModality.slice(1)} Modality`,
              content: this.getPersonalizedModalityIntro(chartData.sunSign, sunModality)
            }
          });
          content.push({
            type: 'text',
            data: {
              title: `The Three Modalities in Astrology`,
              content: this.getModalitiesOverview()
            }
          });
          content.push({
            type: 'text',
            data: {
              title: `Your ${chartData.sunSign} Sun: ${sunModality.charAt(0).toUpperCase() + sunModality.slice(1)} Modality Expression`,
              content: this.getModalityExpression(chartData.sunSign, sunModality)
            }
          });
          content.push({
            type: 'interactive',
            data: {
              type: 'modality-explorer',
              sign: chartData.sunSign,
              modality: sunModality
            }
          });
        } else {
          // Default fallback for other basics lessons
          content.push({
            type: 'text',
            data: {
              title: lesson.title,
              content: `This lesson provides personalized insights about ${lesson.title.toLowerCase()} based on your birth chart.`
            }
          });
        }
        break;
      
      default:
        // Default case for other lesson tracks
        content.push({
          type: 'text',
          data: {
            title: lesson.title,
            content: `This ${lesson.track} lesson provides personalized insights based on your astrological chart.`
          }
        });
    }
  }
  
  return content;
}