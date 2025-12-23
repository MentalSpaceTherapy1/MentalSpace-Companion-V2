/**
 * MentalSpace iOS Widget
 * WidgetKit implementation for home screen widgets
 *
 * NOTE: This file needs to be added to an iOS Widget Extension target
 * Run `npx expo prebuild` first, then add a Widget Extension in Xcode
 */

import WidgetKit
import SwiftUI

// MARK: - Data Models

struct CheckinData: Codable {
    let hasCheckedIn: Bool
    let currentStreak: Int
    let lastMood: Int?
    let lastCheckinDate: String?
}

// MARK: - Timeline Provider

struct MentalSpaceProvider: TimelineProvider {

    func placeholder(in context: Context) -> MentalSpaceEntry {
        MentalSpaceEntry(
            date: Date(),
            hasCheckedIn: false,
            currentStreak: 0,
            lastMood: nil
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (MentalSpaceEntry) -> Void) {
        let entry = MentalSpaceEntry(
            date: Date(),
            hasCheckedIn: false,
            currentStreak: 7,
            lastMood: 7
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MentalSpaceEntry>) -> Void) {
        // Read data from shared UserDefaults (App Group)
        let data = loadCheckinData()

        let entry = MentalSpaceEntry(
            date: Date(),
            hasCheckedIn: data.hasCheckedIn,
            currentStreak: data.currentStreak,
            lastMood: data.lastMood
        )

        // Refresh at midnight
        let nextUpdate = Calendar.current.startOfDay(for: Date().addingTimeInterval(86400))
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

        completion(timeline)
    }

    private func loadCheckinData() -> CheckinData {
        guard let userDefaults = UserDefaults(suiteName: "group.com.mentalspace.companion"),
              let data = userDefaults.data(forKey: "checkinData"),
              let checkinData = try? JSONDecoder().decode(CheckinData.self, from: data) else {
            return CheckinData(hasCheckedIn: false, currentStreak: 0, lastMood: nil, lastCheckinDate: nil)
        }
        return checkinData
    }
}

// MARK: - Timeline Entry

struct MentalSpaceEntry: TimelineEntry {
    let date: Date
    let hasCheckedIn: Bool
    let currentStreak: Int
    let lastMood: Int?
}

// MARK: - Widget Views

struct MentalSpaceWidgetEntryView: View {
    var entry: MentalSpaceProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

struct SmallWidgetView: View {
    let entry: MentalSpaceEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Streak
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundColor(.orange)
                Text("\(entry.currentStreak)")
                    .font(.title2)
                    .fontWeight(.bold)
            }

            Text(entry.currentStreak == 1 ? "Day Streak" : "Day Streak")
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()

            // Check-in status
            if entry.hasCheckedIn {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Done")
                        .font(.caption)
                        .foregroundColor(.green)
                }
            } else {
                Link(destination: URL(string: "mentalspace://checkin")!) {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                        Text("Check-in")
                            .font(.caption)
                    }
                    .foregroundColor(.blue)
                }
            }
        }
        .padding()
    }
}

struct MediumWidgetView: View {
    let entry: MentalSpaceEntry

    var body: some View {
        HStack {
            // Left: Streak info
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.orange)
                        .font(.title)
                    Text("\(entry.currentStreak)")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                }
                Text("Day Streak")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Right: Action/Status
            VStack(alignment: .trailing, spacing: 8) {
                if entry.hasCheckedIn {
                    VStack(alignment: .trailing) {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Checked In")
                                .font(.headline)
                        }
                        if let mood = entry.lastMood {
                            Text("Mood: \(mood)/10")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                } else {
                    Link(destination: URL(string: "mentalspace://checkin")!) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Check-in Now")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.blue)
                        .cornerRadius(20)
                    }
                }
            }
        }
        .padding()
    }
}

// MARK: - Widget Configuration

@main
struct MentalSpaceWidget: Widget {
    let kind: String = "MentalSpaceWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: MentalSpaceProvider()) { entry in
            MentalSpaceWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("MentalSpace")
        .description("Track your daily check-ins and streaks")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Previews

struct MentalSpaceWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            MentalSpaceWidgetEntryView(
                entry: MentalSpaceEntry(
                    date: Date(),
                    hasCheckedIn: false,
                    currentStreak: 7,
                    lastMood: nil
                )
            )
            .previewContext(WidgetPreviewContext(family: .systemSmall))

            MentalSpaceWidgetEntryView(
                entry: MentalSpaceEntry(
                    date: Date(),
                    hasCheckedIn: true,
                    currentStreak: 14,
                    lastMood: 8
                )
            )
            .previewContext(WidgetPreviewContext(family: .systemMedium))
        }
    }
}
