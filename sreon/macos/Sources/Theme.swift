// =====================================================================
//  Sreon — Visual Identity & Theme
//  Powered by SPRFST Language
//  Deep black, near-black panels, vivid orange, warm amber, soft white.
// =====================================================================
import AppKit

enum SreonTheme {
    // Surfaces
    static let ink        = NSColor(srgbRed: 0.043, green: 0.043, blue: 0.055, alpha: 1.0)  // #0B0B0E
    static let panel      = NSColor(srgbRed: 0.071, green: 0.071, blue: 0.086, alpha: 1.0)  // #121216
    static let raised     = NSColor(srgbRed: 0.102, green: 0.102, blue: 0.125, alpha: 1.0)  // #1A1A20
    static let edge       = NSColor(srgbRed: 0.145, green: 0.145, blue: 0.173, alpha: 1.0)  // #25252C

    // Typography
    static let text       = NSColor(srgbRed: 0.953, green: 0.953, blue: 0.961, alpha: 1.0)  // #F3F3F5
    static let muted      = NSColor(srgbRed: 0.620, green: 0.620, blue: 0.659, alpha: 1.0)  // #9E9EA8
    static let faint      = NSColor(srgbRed: 0.384, green: 0.384, blue: 0.431, alpha: 1.0)  // #62626E

    // Vivid Sreon Orange & Amber Accents
    static let orange     = NSColor(srgbRed: 1.000, green: 0.420, blue: 0.000, alpha: 1.0)  // #FF6B00
    static let orangeGlow = NSColor(srgbRed: 1.000, green: 0.420, blue: 0.000, alpha: 0.3)
    static let amber      = NSColor(srgbRed: 1.000, green: 0.631, blue: 0.212, alpha: 1.0)  // #FFA136
    static let amberLight = NSColor(srgbRed: 1.000, green: 0.753, blue: 0.431, alpha: 1.0)  // #FFC06E
    
    // Status Accents
    static let green      = NSColor(srgbRed: 0.063, green: 0.725, blue: 0.506, alpha: 1.0)
    static let blue       = NSColor(srgbRed: 0.231, green: 0.510, blue: 0.965, alpha: 1.0)
    static let red        = NSColor(srgbRed: 0.937, green: 0.267, blue: 0.267, alpha: 1.0)

    // Window Geometry
    static let cornerRadius: CGFloat = 14.0
    static let topBarHeight: CGFloat = 52.0
    static let railWidth: CGFloat = 58.0
    static let statusHeight: CGFloat = 28.0
}

enum SreonFonts {
    static func title(_ size: CGFloat) -> NSFont {
        return NSFont.systemFont(ofSize: size, weight: .bold)
    }

    static func body(_ size: CGFloat) -> NSFont {
        return NSFont.systemFont(ofSize: size, weight: .regular)
    }

    static func medium(_ size: CGFloat) -> NSFont {
        return NSFont.systemFont(ofSize: size, weight: .medium)
    }

    static func mono(_ size: CGFloat) -> NSFont {
        return NSFont.monospacedSystemFont(ofSize: size, weight: .regular)
    }
}
